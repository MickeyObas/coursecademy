import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';


const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    
    try{
      setLoading(true);
      const response = await api.post(`/api/auth/token/`, {
        email: email,
        password: password,
        remember_me: rememberMe
      });
      const data = await response.data;
      console.log(data);
      login(data);
      setEmail('');
      setPassword('');

      if(data.user.account_type === "S"){
        navigate('/')
      }else if(data.user.account_type === "I"){
        navigate('/idashboard/');
      }else{
        alert("Invalid account type");
        return;
      }
      
    }catch(error: any){
      if(error.response){
        console.log(error.response.data);
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
    <div className="w-full max-w-md sm:max-w-lg bg-white rounded-xl shadow-md p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-6">
        Login to Your Account
      </h2>

      {error && (
        <div className="text-red-600 text-sm sm:text-base mb-4 text-center px-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-base focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-base focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            {/* <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-xs sm:text-sm text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'} 
            </button> */}
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <label className="flex items-center space-x-2 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="form-checkbox"
            />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm sm:text-base text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 sm:py-3 text-sm sm:text-base hover:bg-blue-700 transition"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <p className="text-center text-sm sm:text-base mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  </div>
)}


export default Login;
