import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const EnterCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = sessionStorage.getItem('userVerifyEmail');
  const token = sessionStorage.getItem('userVerifyToken');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    try{
      setLoading(true);
      setError('');
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          token: token
        })
      });
      if(!response.ok){
        const errorResponse = await response.json();
        console.log(errorResponse);
        setError(errorResponse.error);
      }else{
        const data = await response.json();
        console.log(data);
        navigate(`/complete-registration/`, {state: {'email': data.email}});
        sessionStorage.removeItem('userVerifyEmail');
        sessionStorage.removeItem('userVerifyToken');
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
        <h2 className="text-2xl font-semibold text-center mb-6">Enter Verification Code</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          A 6-digit code was sent to <span className="font-medium">{email}</span>
        </p>

        {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">Verification Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-center tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterCode;
