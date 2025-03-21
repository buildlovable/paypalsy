
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  phone?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'request';
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  note?: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}
