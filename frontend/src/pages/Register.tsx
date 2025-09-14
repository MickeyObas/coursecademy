import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [accountType, setAccountType] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({
    general: '',
    email: '',
    password: '',
    password2: '',
    full_name: ''
  });

  useEffect(() => {
    // In case user goes to complete-registration route directly, for some weird reason 
    if(!email){
      navigate('/register/');
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !password || !confirmPassword) {
      setError((prev) => ({...prev, general: 'Please fill in all fields'}));
      return;
    }

    if (password !== confirmPassword) {
      setError((prev) => ({...prev, password2: 'Passwords do not match'}));
      return;
    }

    setError({
      general: '',
      email: '',
      password: '',
      password2: '',
      full_name: ''
    });
    
    try{
      setLoading(true);
      
      const response = await api.post(`/api/auth/register/`, {
        account_type: accountType,
        full_name: fullName,
        email: email,
        password: password,
        password2: confirmPassword
      });
      console.log(response.data);
      navigate('/login/');
    }catch(error: any){
      if(error.response){
        console.log(error.response.data);
        setError({
          email: error.response.data.email || '',
          password: error.response.data.password || '',
          password2: error.response.data.password2 || '',
          general: '',
          full_name: error.response.data.full_name || ""
        });
      }else{
        console.error(error);
        setError((prev) => ({...prev, general: 'Network error. Please try again'}))
      }
    }finally{
      setLoading(false);
    }

  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="w-full max-w-md sm:max-w-lg bg-white rounded-xl shadow-md p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-6">
        Create Your Account
      </h2>

      {error.general && (
        <div className="text-red-600 text-sm sm:text-base mb-4 text-center px-2">
          {error.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account type */}
        <select
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm sm:text-base"
        >
          <option value="">Select an account type</option>
          <option value="S">Student</option>
          <option value="I">Instructor</option>
        </select>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm sm:text-base font-medium mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled={true}
            className="w-full border rounded px-3 py-2 text-base focus:outline-none focus:ring focus:ring-blue-500 bg-slate-100"
            required
          />
          <p className="text-red-600 text-xs sm:text-sm min-h-4">{error.email}</p>
        </div>

        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm sm:text-base font-medium mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-base focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <p className="text-red-600 text-xs sm:text-sm min-h-4">{error.full_name}</p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm sm:text-base font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 pr-16 text-base focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <p className="text-red-600 text-xs sm:text-sm min-h-4">{error.password}</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm sm:text-base font-medium mb-1"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 pr-16 text-base focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-xs sm:text-sm text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-red-600 text-xs sm:text-sm min-h-4">{error.password2}</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 sm:py-3 text-sm sm:text-base hover:bg-blue-700 transition"
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm sm:text-base mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  </div>
);
};

export default Register;
