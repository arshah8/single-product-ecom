import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';
import { useCheckout } from '../hooks/useCheckout';
import ShippingForm from '../components/ShippingForm';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PaymentForm from '../components/PaymentForm';
import OrderSummary from '../components/OrderSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * Checkout Form Schema
 */
const checkoutSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address (e.g. user@example.com)')
    .required('Email is required'),
  firstName: Yup.string()
    .matches(/^[a-zA-Z\s-]+$/, 'First name should only contain letters')
    .required('First name is required'),
  lastName: Yup.string()
    .matches(/^[a-zA-Z\s-]+$/, 'Last name should only contain letters')
    .required('Last name is required'),
  shippingAddress: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string()
      .matches(/^[a-zA-Z\s.-]+$/, 'City should only contain letters, spaces, dots or hyphens')
      .required('City is required'),
    state: Yup.string()
      .matches(/^[a-zA-Z\s.-]+$/, 'State should only contain letters, spaces, dots or hyphens')
      .required('State is required'),
    zipCode: Yup.string()
      .matches(/^\d{5,10}$/, 'ZIP code should be between 5 and 10 digits')
      .required('ZIP code is required'),
    country: Yup.string()
      .matches(/^[a-zA-Z\s.-]+$/, 'Country should only contain letters, spaces, dots or hyphens')
      .required('Country is required'),
  }),
  useSameAddress: Yup.boolean(),
  billingAddress: Yup.object().when('useSameAddress', {
    is: false,
    then: () => Yup.object({
      street: Yup.string().required('Street address is required'),
      city: Yup.string()
        .matches(/^[a-zA-Z\s.-]+$/, 'City should only contain letters, spaces, dots or hyphens')
        .required('City is required'),
      state: Yup.string()
        .matches(/^[a-zA-Z\s.-]+$/, 'State should only contain letters, spaces, dots or hyphens')
        .required('State is required'),
      zipCode: Yup.string()
        .matches(/^\d{5,10}$/, 'ZIP code should be between 5 and 10 digits')
        .required('ZIP code is required'),
      country: Yup.string()
        .matches(/^[a-zA-Z\s.-]+$/, 'Country should only contain letters, spaces, dots or hyphens')
        .required('Country is required'),
    }),
    otherwise: () => Yup.object().notRequired()
  }),
  paymentMethod: Yup.string().required('Please select a payment method'),
});

function CheckoutContent() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cart: storeCart, fetchCart } = useCartStore();
  const { cart: swrCart, isLoading: isCartLoading, mutate: mutateCart } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const { createCheckoutSession, confirmCheckout, isLoading: isCheckoutLoading, error: checkoutError } = useCheckout();

  const cart = swrCart || storeCart;
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [checkoutSession, setCheckoutSession] = useState(null);

  useEffect(() => {
    fetchCart().then(() => mutateCart()).catch(() => { });
  }, [fetchCart, mutateCart]);

  const initialValues = {
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    useSameAddress: true,
    paymentMethod: 'stripe',
  };

  const handleCreateSession = async (values, { setSubmitting }) => {
    try {
      const { useSameAddress, billingAddress, ...data } = values;
      const finalBillingAddress = useSameAddress ? values.shippingAddress : billingAddress;

      const session = await createCheckoutSession({
        ...data,
        billingAddress: finalBillingAddress,
      });

      setCheckoutSession(session);
      setStep(2);
    } catch (err) {
      console.error('Checkout session error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalConfirm = async (values) => {
    const finalBillingAddress = values.useSameAddress ? values.shippingAddress : values.billingAddress;

    try {
      if (values.paymentMethod === 'cash_on_delivery') {
        const order = await confirmCheckout({
          checkoutSessionId: checkoutSession.checkoutSessionId,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          paymentMethod: values.paymentMethod,
          shippingAddress: values.shippingAddress,
          billingAddress: finalBillingAddress,
        });
        navigate(`/order-confirmation/${order.orderNumber}`);
      } else {
        if (!stripe || !elements) return;

        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret: checkoutSession.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/order-confirmation`,
          },
          redirect: 'if_required',
        });

        if (confirmError) throw new Error(confirmError.message);

        const order = await confirmCheckout({
          checkoutSessionId: checkoutSession.checkoutSessionId,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          paymentMethod: values.paymentMethod,
          shippingAddress: values.shippingAddress,
          billingAddress: finalBillingAddress,
        });
        navigate(`/order-confirmation/${order.orderNumber}`);
      }
    } catch (err) {
      console.error('Final confirmation error:', err);
    }
  };

  if (isCartLoading && !cart) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/cart')} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 transition-colors">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 transition-colors">Checkout</h1>

      {checkoutError && <ErrorMessage error={checkoutError} className="mb-6" />}

      <Formik
        initialValues={initialValues}
        validationSchema={checkoutSchema}
        onSubmit={handleCreateSession}
        enableReinitialize={true}
      >
        {(formik) => (
          <Form className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {step === 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-8 animate-fade-in transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">Email *</label>
                      <input
                        id="email"
                        {...formik.getFieldProps('email')}
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all ${formik.touched.email && formik.errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        placeholder="your@email.com"
                        disabled={isAuthenticated && user?.email}
                      />
                      {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">First Name *</label>
                      <input
                        id="firstName"
                        {...formik.getFieldProps('firstName')}
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        placeholder="John"
                        disabled={isAuthenticated && user?.firstName}
                      />
                      {formik.touched.firstName && formik.errors.firstName && <p className="mt-1 text-xs text-red-500">{formik.errors.firstName}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">Last Name *</label>
                      <input
                        id="lastName"
                        {...formik.getFieldProps('lastName')}
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        placeholder="Doe"
                        disabled={isAuthenticated && user?.lastName}
                      />
                      {formik.touched.lastName && formik.errors.lastName && <p className="mt-1 text-xs text-red-500">{formik.errors.lastName}</p>}
                    </div>
                  </div>

                  <ShippingForm namePrefix="shippingAddress" title="Shipping Address" />

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="flex items-center group cursor-pointer w-fit">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id="useSameAddress"
                          name="useSameAddress"
                          checked={formik.values.useSameAddress}
                          onChange={formik.handleChange}
                          className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                          <svg
                            className={`w-3.5 h-3.5 text-white transition-opacity ${formik.values.useSameAddress ? 'opacity-100' : 'opacity-0'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Billing address same as shipping
                      </span>
                    </label>
                  </div>

                  {!formik.values.useSameAddress && (
                    <div className="animate-fade-in pt-4 border-t border-gray-50 dark:border-gray-800">
                      <ShippingForm namePrefix="billingAddress" title="Billing Address" />
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                    <PaymentMethodSelector
                      selectedMethod={formik.values.paymentMethod}
                      onSelect={(val) => formik.setFieldValue('paymentMethod', val)}
                      errors={formik.touched.paymentMethod && formik.errors.paymentMethod ? { paymentMethod: formik.errors.paymentMethod } : {}}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formik.isSubmitting || isCheckoutLoading}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.99] mt-4"
                  >
                    {formik.isSubmitting || isCheckoutLoading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Setting up Secure Payment...
                      </span>
                    ) : (
                      'Continue to Payment'
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-6 animate-fade-in transition-colors">
                  {formik.values.paymentMethod === 'stripe' ? (
                    <PaymentForm
                      onSubmit={() => handleFinalConfirm(formik.values)}
                      isLoading={isCheckoutLoading}
                      error={checkoutError}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Cash on Delivery</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto transition-colors">
                        Your items will be delivered to your door and you can pay in person.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFinalConfirm(formik.values)}
                        disabled={isCheckoutLoading}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all font-bold text-lg shadow-lg"
                      >
                        {isCheckoutLoading ? (
                          <span className="flex items-center justify-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing...
                          </span>
                        ) : (
                          'Complete Order'
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold py-2 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shipping details
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <OrderSummary
                  cart={cart}
                  shippingCost={checkoutSession?.shippingCost || 0}
                />

                <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure SSL Encrypted Checkout
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
          },
        },
      }}
    >
      <CheckoutContent />
    </Elements>
  );
}
