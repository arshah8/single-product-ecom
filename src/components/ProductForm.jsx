import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api, getImageUrl } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ImageUploader from './ImageUploader';
import { RxCross1 } from 'react-icons/rx';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/**
 * Product Form Component for creating and editing products using Formik and Yup
 */
export default function ProductForm({ product, onClose, onSuccess }) {
  const [imageUrl, setImageUrl] = useState('');
  const { data: categories = [] } = useSWR('/categories', api.getCategories);
  const isEditing = !!product;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    description: Yup.string(),
    price: Yup.number()
      .min(0, 'Price cannot be negative')
      .required('Price is required'),
    stock: Yup.number()
      .integer('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .required('Stock is required'),
    category: Yup.string().required('Category is required'),
    images: Yup.array().of(Yup.string()),
  });

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      stock: product?.stock || '',
      category: product?.category || '',
      images: product?.images || [],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        if (isEditing) {
          await api.updateProduct(product._id, values);
        } else {
          await api.createProduct(values);
        }
        onSuccess();
      } catch (err) {
        setStatus(err.message || 'Failed to save product');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      const url = imageUrl.trim();
      // Basic URL validation before adding to array
      if (!url.startsWith('http')) {
        return; // Or show local error
      }
      formik.setFieldValue('images', [...formik.values.images, url]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formik.values.images.filter((_, i) => i !== index);
    formik.setFieldValue('images', newImages);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100 border border-transparent dark:border-gray-800">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all"
              aria-label="Close"
            >
              <RxCross1 className="w-6 h-6" />
            </button>
          </div>

          {formik.status && <ErrorMessage error={formik.status} className="mb-6" />}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                {...formik.getFieldProps('name')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formik.touched.name && formik.errors.name
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                placeholder="Fresh Organic Pomegranate"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                {...formik.getFieldProps('description')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                placeholder="Describe the product features and benefits..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                  Price ($) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  {...formik.getFieldProps('price')}
                  className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formik.touched.price && formik.errors.price
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  placeholder="0.00"
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.price}</p>
                )}
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                  Initial Stock *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  {...formik.getFieldProps('stock')}
                  className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formik.touched.stock && formik.errors.stock
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  placeholder="Quantity available"
                />
                {formik.touched.stock && formik.errors.stock && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                Category *
              </label>
              <select
                id="category"
                name="category"
                {...formik.getFieldProps('category')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formik.touched.category && formik.errors.category
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} className="dark:bg-gray-800">
                    {cat.name}
                  </option>
                ))}
              </select>
              {formik.touched.category && formik.errors.category && (
                <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.category}</p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 transition-colors">
                Product Images
              </label>

              <div className="mb-6">
                <ImageUploader
                  currentImages={formik.values.images}
                  onUploadSuccess={(url) => {
                    formik.setFieldValue('images', [...formik.values.images, url]);
                  }}
                  onUploadError={(error) => {
                    formik.setStatus(error);
                  }}
                />
              </div>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste external image URL here..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
                >
                  Add Link
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formik.values.images.map((img, index) => (
                  <div key={index} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <img
                      src={getImageUrl(img)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm"
                      title="Remove image"
                    >
                      <RiDeleteBin7Line className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {formik.values.images.length === 0 && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-2 italic font-medium transition-colors">No images added yet</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex-[2] bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all font-bold shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {formik.isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving Changes...
                  </span>
                ) : (
                  isEditing ? 'Update Product Details' : 'Publish Product'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
