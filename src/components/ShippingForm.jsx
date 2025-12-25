import { useFormikContext } from 'formik';

/**
 * Shipping Form Component - Optimized for Formik
 * @param {string} namePrefix - Prefix for field names (e.g., 'shippingAddress')
 * @param {string} title - Title to display (default: 'Shipping Address')
 */
export default function ShippingForm({ namePrefix, title = 'Shipping Address' }) {
  const { getFieldProps, touched, errors } = useFormikContext();

  // Helper to get nested error/touched state
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const hasError = (field) => {
    const fullPath = `${namePrefix}.${field}`;
    return getNestedValue(touched, fullPath) && getNestedValue(errors, fullPath);
  };

  const getErrorMessage = (field) => {
    const fullPath = `${namePrefix}.${field}`;
    return getNestedValue(errors, fullPath);
  };

  const getInputClass = (field) => {
    return `w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-100 ${hasError(field)
      ? 'border-red-500 focus:ring-1 focus:ring-red-500 ring-red-500'
      : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
      }`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">{title}</h3>

      <div>
        <label htmlFor={`${namePrefix}.street`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
          Street Address *
        </label>
        <input
          type="text"
          id={`${namePrefix}.street`}
          {...getFieldProps(`${namePrefix}.street`)}
          className={getInputClass('street')}
          placeholder="123 Main St"
        />
        {hasError('street') && (
          <p className="mt-1 text-xs text-red-500 font-medium">{getErrorMessage('street')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${namePrefix}.city`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            City *
          </label>
          <input
            type="text"
            id={`${namePrefix}.city`}
            {...getFieldProps(`${namePrefix}.city`)}
            className={getInputClass('city')}
            placeholder="New York"
          />
          {hasError('city') && (
            <p className="mt-1 text-xs text-red-500 font-medium">{getErrorMessage('city')}</p>
          )}
        </div>
        <div>
          <label htmlFor={`${namePrefix}.state`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            State *
          </label>
          <input
            type="text"
            id={`${namePrefix}.state`}
            {...getFieldProps(`${namePrefix}.state`)}
            className={getInputClass('state')}
            placeholder="NY"
          />
          {hasError('state') && (
            <p className="mt-1 text-xs text-red-500 font-medium">{getErrorMessage('state')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${namePrefix}.zipCode`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            ZIP Code *
          </label>
          <input
            type="text"
            id={`${namePrefix}.zipCode`}
            {...getFieldProps(`${namePrefix}.zipCode`)}
            className={getInputClass('zipCode')}
            placeholder="10001"
          />
          {hasError('zipCode') && (
            <p className="mt-1 text-xs text-red-500 font-medium">{getErrorMessage('zipCode')}</p>
          )}
        </div>
        <div>
          <label htmlFor={`${namePrefix}.country`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
            Country *
          </label>
          <input
            type="text"
            id={`${namePrefix}.country`}
            {...getFieldProps(`${namePrefix}.country`)}
            className={getInputClass('country')}
            placeholder="United States"
          />
          {hasError('country') && (
            <p className="mt-1 text-xs text-red-500 font-medium">{getErrorMessage('country')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
