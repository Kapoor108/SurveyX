import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      api.get('/auth/me').then(res => {
        loginWithToken(token, res.data.user);
        const role = res.data.user.role;
        navigate(role === 'admin' ? '/admin' : role === 'ceo' ? '/ceo' : '/dashboard');
      }).catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>;
};

export default AuthCallback;
