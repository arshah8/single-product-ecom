import OrderLookup from '../components/OrderLookup';

/**
 * Order Lookup Page
 * Public page for guests to lookup orders by order number
 */
export default function OrderLookupPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center transition-colors">
          Track Your Order
        </h1>
        <OrderLookup />
      </div>
    </div>
  );
}

