import LoginForm from '../components/LoginForm';

/**
 * Login Page
 */
export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <LoginForm />
    </div>
  );
}

