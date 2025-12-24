import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CXOLogo from '../components/CXOLogo';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState('loading'); // loading, invalid, details, otp
  const [inviteData, setInviteData] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  // Verify invite token on mount
  useEffect(() => {
    if (!token) {
      setStep('invalid');
      setError('Invitation link required. You can only sign up via an invitation.');
      return;
    }

    api.get(`/auth/verify-invite/${token}`)
      .then(res => {
        if (res.data.valid) {
          setInviteData(res.data);
          setStep('details');
        } else {
          setStep('invalid');
          setError(res.data.error || 'Invalid invitation');
        }
      })
      .catch(err => {
        setStep('invalid');
        setError(err.response?.data?.error || 'Invalid or expired invitation link');
      });
  }, [token]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup/send-otp', { token });
      setMessage(res.data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup/verify-otp', { 
        token, 
        otp, 
        name, 
        password 
      });
      loginWithToken(res.data.token, res.data.user);
      
      // Redirect based on role
      const role = res.data.user.role;
      navigate(role === 'ceo' ? '/ceo' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email: inviteData.email, type: 'signup' });
      setMessage('OTP resent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid/No token state
  if (step === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <CXOLogo size="md" showText={true} />
          </div>
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invitation Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">
              This application uses invite-only registration. Please contact your organization administrator to receive an invitation.
            </p>
          </div>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <CXOLogo size="md" showText={true} />
        </div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Invite Info Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg mb-6 -mt-4 -mx-8">
          <div className="text-center pt-4">
            <p className="text-indigo-100 text-sm">You're invited to join</p>
            <h2 className="text-xl font-bold">{inviteData?.orgName}</h2>
            <p className="text-indigo-200 text-sm mt-1">
              as {inviteData?.role === 'ceo' ? 'CEO' : 'Team Member'}
              {inviteData?.departmentName && ` • ${inviteData.departmentName}`}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          {step === 'details' ? 'Create Your Account' : 'Verify Email'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}

        {step === 'details' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={inviteData?.email || ''} 
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600" 
              />
              <p className="text-xs text-gray-500 mt-1">Email is locked to your invitation</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
                placeholder="Enter your full name"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                placeholder="Min 6 characters"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              We've sent a verification code to<br/>
              <span className="font-medium">{inviteData?.email}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                required
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <div className="flex justify-between text-sm">
              <button 
                type="button" 
                onClick={() => setStep('details')} 
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button 
                type="button" 
                onClick={handleResendOTP} 
                disabled={loading} 
                className="text-indigo-600 hover:text-indigo-800"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
