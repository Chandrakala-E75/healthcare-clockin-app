export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'careworker';
  picture?: string;
  department?: string;
  employeeId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  switchRole: (role: 'manager' | 'careworker') => void; // For demo purposes
}