
import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { CreditCard, PlusCircle, CheckCircle, Trash, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodForm } from './PaymentMethodForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const PaymentMethods = () => {
  const { paymentMethods, isLoading, setDefaultMethod, removePaymentMethod, refreshPaymentMethods } = usePaymentMethods();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleAddCard = () => {
    setIsAddingCard(true);
  };

  const handleCardAdded = () => {
    setIsAddingCard(false);
    refreshPaymentMethods();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultMethod(id);
  };

  const handleDeleteCard = async () => {
    if (deletingCardId) {
      await removePaymentMethod(deletingCardId);
      setDeletingCardId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment Methods</h2>
        <Button variant="outline" onClick={handleAddCard}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed">
          <CreditCard className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No payment methods found</p>
          <Button variant="outline" onClick={handleAddCard}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add your first card
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {method.card_brand} •••• {method.last_four}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expires_at}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {method.is_default ? (
                  <Button variant="ghost" size="sm" className="text-green-600" disabled>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Default
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingCardId(method.id)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            onSuccess={handleCardAdded}
            onCancel={() => setIsAddingCard(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCardId}
        onOpenChange={(open) => !open && setDeletingCardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCard} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
