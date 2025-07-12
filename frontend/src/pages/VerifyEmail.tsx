import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils';
import { BACKEND_URL } from '../config';

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
      const response = await fetch(`${BACKEND_URL}/api/auth/send-confirmation-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });
      if(!response.ok){
        const errorResponse = await response.json();
        setError(errorResponse.error);
        console.log("Whoops, something went wrong.", errorResponse);
      }else{
        const data = await response.json();
        console.log(data);
        sessionStorage.setItem('userVerifyToken', data.user_verify_token);
        sessionStorage.setItem('userVerifyEmail', data.user_verify_email);
        navigate('/enter-code/');
      }
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
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
