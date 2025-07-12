import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import EnterCode from '../pages/EnterCode';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<VerifyEmail />} />
      <Route path="/complete-registration" element={<Register />} />
      <Route path="/enter-code" element={<EnterCode />} />
    </Routes>
  );
};

export default AuthRoutes;
