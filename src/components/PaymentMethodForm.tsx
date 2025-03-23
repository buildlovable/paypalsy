
import { useState, useEffect } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51Ox4mfLtTIW5YVQJ7hjMhFxhisBSy7OvgQx3VBWBZeE0Zw8NwZWzQ9MCOyGZ2Xmdu2OmQ6C6aqbkTRUWH5w9DnXX00uoWBfHqI');

const CardForm = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { confirmPaymentMethod } = usePaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        toast.error(result.error.message || 'Something went wrong');
        return;
      }

      if (result.setupIntent.status === 'succeeded' && result.setupIntent.payment_method) {
        const success = await confirmPaymentMethod(result.setupIntent.payment_method.toString());
        if (success) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Payment method error:', error);
      toast.error('Failed to process payment method');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
        >
          {isLoading ? 'Processing...' : 'Save Card'}
        </Button>
      </div>
    </form>
  );
};

export const PaymentMethodForm = ({ 
  onSuccess,
  onCancel
}: { 
  onSuccess: () => void,
  onCancel: () => void
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { addPaymentMethod } = usePaymentMethods();

  // Fixed: Changed useState to useEffect
  useEffect(() => {
    const getSetupIntent = async () => {
      const secret = await addPaymentMethod();
      if (secret) {
        setClientSecret(secret);
      } else {
        onCancel();
      }
    };

    getSetupIntent();
  }, [addPaymentMethod, onCancel]);

  if (!clientSecret) {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};
