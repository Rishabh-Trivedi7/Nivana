import { useAuth } from '../context/AuthContext.jsx';

export default function useAuthGuard() {
  return useAuth();
}
