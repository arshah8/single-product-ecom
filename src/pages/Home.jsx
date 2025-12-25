import ProductList from '../components/ProductList';

/**
 * Home Page
 * Main landing page with product listing
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <ProductList />
    </div>
  );
}

