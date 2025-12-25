import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useCartStore } from '../store/cartStore';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/**
 * Register Form Component using Formik and Yup
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .max(50, 'First name is too long')
      .matches(/^[a-zA-Z\s-]+$/, 'First name should only contain letters')
      .required('First name is required'),
    lastName: Yup.string()
      .max(50, 'Last name is too long')
      .matches(/^[a-zA-Z\s-]+$/, 'Last name should only contain letters')
      .required('Last name is required'),
    email: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address (e.g. user@example.com)')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and a number'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus, setFieldValue }) => {
      try {
        const { confirmPassword, ...registerData } = values;
        const response = await api.register(registerData);

        // Set auth state
        setAuth(response.user, response.accessToken, response.refreshToken);

        // Show conversion messages if applicable
        if (response.cartConverted || response.ordersLinked > 0) {
          // Refresh cart to show converted items
          await fetchCart();
        }

        setStatus({ success: true });

        // Navigate to home after a brief delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        setStatus({ error: err.message || 'Registration failed. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (formik.status?.success) {
    return (
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-10 text-center animate-fade-in border border-transparent dark:border-gray-800">
        <div className="text-green-500 mb-6">
          <svg
            className="w-20 h-20 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Account Created!</h2>
        <p className="text-gray-600 dark:text-gray-400">Welcome to S-Prod-Ecom. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 border border-transparent dark:border-gray-800 transition-colors duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Create Account</h2>

      {formik.status?.error && <ErrorMessage error={formik.status.error} className="mb-6" />}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              {...formik.getFieldProps('firstName')}
              className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.firstName && formik.errors.firstName
                ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
                }`}
              placeholder="John"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              {...formik.getFieldProps('lastName')}
              className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.lastName && formik.errors.lastName
                ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
                }`}
              placeholder="Doe"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            {...formik.getFieldProps('email')}
            className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.email && formik.errors.email
              ? 'border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
              }`}
            placeholder="your@email.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            {...formik.getFieldProps('password')}
            className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.password && formik.errors.password
              ? 'border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
              }`}
            placeholder="At least 8 characters"
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Include mix of letters and numbers
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            {...formik.getFieldProps('confirmPassword')}
            className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.confirmPassword && formik.errors.confirmPassword
              ? 'border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
              }`}
            placeholder="Confirm your password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow-md active:transform active:scale-[0.98] mt-2"
        >
          {formik.isSubmitting ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-1 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
