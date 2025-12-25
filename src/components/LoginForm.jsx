import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useCartStore } from '../store/cartStore';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/**
 * Login Form Component using Formik and Yup
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address (e.g. user@example.com)')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const response = await api.login(values);

        // Set auth state
        setAuth(response.user, response.accessToken, response.refreshToken);

        // Show conversion messages if applicable
        if (response.cartConverted) {
          // Refresh cart to show merged items
          await fetchCart();
        }

        // Navigate to intended destination or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } catch (err) {
        setStatus(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 border border-transparent dark:border-gray-800 transition-colors duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Login</h2>

      {formik.status && <ErrorMessage error={formik.status} className="mb-4" />}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
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
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.email}</p>
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
            placeholder="Enter your password"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow-md active:transform active:scale-[0.98]"
        >
          {formik.isSubmitting ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Verifying...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-1 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
