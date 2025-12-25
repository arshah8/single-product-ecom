import { useSearchParams } from 'react-router-dom';

/**
 * Sort Dropdown Component
 * Uses URL query params for state management
 */
export default function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ];

  const handleSortChange = (value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set('sort', value);
      } else {
        newParams.delete('sort');
      }
      return newParams;
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Sort by:</label>
      <select
        value={searchParams.get('sort') || ''}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

