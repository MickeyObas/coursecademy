import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils/utils';
import api from '../utils/axios';


const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if(!validateEmail(email.trim())){
      setError('Please enter a valid email.');
      return;
    }

    setError('');
    setLoading(true);

    try{
      const response = await api.post(`/api/auth/send-confirmation-code/`, {
        email: email.trim()
      });
      console.log(response.data);
      sessionStorage.setItem('userVerifyToken', response.data.user_verify_token);
      sessionStorage.setItem('userVerifyEmail', response.data.user_verify_email);
      navigate('/enter-code/');
    }catch(error: any){
      if(error.response){
        console.error(error.response.data);
        setError(error.response.data?.error);
      }else{
        console.error(error);
        setError("Network error. Please try again.");
      }
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Verify Your Email</h2>

        {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
          >
            {loading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
