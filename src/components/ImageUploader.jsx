import React, { useState } from 'react';
import { api, getImageUrl } from '../services/api';

const ImageUploader = ({ onUploadSuccess, onUploadError, currentImages = [] }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.uploadImage(formData);
            if (response.status === 'success') {
                onUploadSuccess(response.data.url);
                setPreview(null); // Clear preview after success if you want, or keep it
            } else {
                onUploadError(response.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            onUploadError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
                {currentImages.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                        <img
                            src={getImageUrl(img)}
                            alt={`Product ${index}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {preview && (
                    <div className="relative w-24 h-24 border rounded overflow-hidden opacity-50">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <label className={`cursor-pointer px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
                {uploading && <span className="text-sm text-gray-500">Processing...</span>}
            </div>
        </div>
    );
};

export default ImageUploader;
