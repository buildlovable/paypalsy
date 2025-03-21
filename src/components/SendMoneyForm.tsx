
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DollarSign, Send } from 'lucide-react';

interface SendMoneyFormProps {
  balance: number;
}

const SendMoneyForm = ({ balance }: SendMoneyFormProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!recipient) {
      toast.error('Please enter a recipient');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    
    setTimeout(() => {
      // Success response simulation
      toast.success(`$${amount} sent to ${recipient}`);
      
      // Reset form
      setRecipient('');
      setAmount('');
      setNote('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient</Label>
        <Input
          id="recipient"
          placeholder="Email, username, or phone number"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={isLoading}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            className="pl-10 bg-white"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Available balance: ${balance.toFixed(2)}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="What's this payment for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          className="bg-white resize-none"
          rows={3}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full py-6 text-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Send className="h-5 w-5 mr-2" />
            Send Money
          </div>
        )}
      </Button>
    </form>
  );
};

export default SendMoneyForm;
