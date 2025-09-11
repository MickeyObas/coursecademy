import { Toaster } from 'react-hot-toast';
import './App.css'
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { RateLimitProvider } from './contexts/RateLimitContext';

function App() {

  return (
    <AuthProvider>
      <RateLimitProvider>
        <AppRoutes />
       <Toaster position='top-center' reverseOrder={false} />
      </RateLimitProvider>
    </AuthProvider>
  )
  
}

export default App
