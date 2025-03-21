
import { Transaction } from '@/lib/types';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionCardProps {
  transaction: Transaction;
  currentUserId: string;
}

const TransactionCard = ({ transaction, currentUserId }: TransactionCardProps) => {
  const isOutgoing = transaction.sender.id === currentUserId;
  const isIncoming = transaction.recipient.id === currentUserId;
  const isPending = transaction.status === 'pending';
  
  // Determine the other party (not the current user)
  const otherParty = isOutgoing ? transaction.recipient : transaction.sender;
  
  // Format the transaction date
  const formattedDate = format(new Date(transaction.date), 'MMM d, h:mm a');
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isPending ? "bg-yellow-100" : 
              isOutgoing ? "bg-red-100" : "bg-green-100"
          )}>
            {isPending ? (
              <Clock className={cn("w-5 h-5", 
                isOutgoing ? "text-yellow-600" : "text-yellow-600"
              )} />
            ) : isOutgoing ? (
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            ) : (
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <p className="font-medium text-gray-900">{otherParty.name}</p>
              {isPending && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {transaction.type === 'payment' ? 
                (isOutgoing ? 'You paid' : 'Paid you') : 
                (isOutgoing ? 'You requested' : 'Requested from you')}
              {transaction.note && ` • ${transaction.note}`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={cn(
            "font-semibold",
            isPending ? "text-gray-600" : 
              isOutgoing ? "text-red-600" : "text-green-600"
          )}>
            {isOutgoing ? '-' : '+'} ${Math.abs(transaction.amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
