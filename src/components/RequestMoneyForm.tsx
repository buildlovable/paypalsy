
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DollarSign, HandCoins } from 'lucide-react';

const RequestMoneyForm = () => {
  const [from, setFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!from) {
      toast.error('Please enter a recipient');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    
    setTimeout(() => {
      // Success response simulation
      toast.success(`Requested $${amount} from ${from}`);
      
      // Reset form
      setFrom('');
      setAmount('');
      setNote('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          placeholder="Email, username, or phone number"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="What's this request for?"
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
            <HandCoins className="h-5 w-5 mr-2" />
            Request Money
          </div>
        )}
      </Button>
    </form>
  );
};

export default RequestMoneyForm;
