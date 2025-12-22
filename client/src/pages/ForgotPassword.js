import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // email, otp, newPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email });
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
    setMessage('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', { email, otp });
      if (res.data.valid) {
        setMessage('OTP verified! Set your new password.');
        setStep('newPassword');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email, type: 'reset' });
      setMessage('OTP resent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">
          {step === 'email' && 'Forgot Password'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'newPassword' && 'Set New Password'}
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          {step === 'email' && 'Enter your email to receive a password reset OTP'}
          {step === 'otp' && 'Enter the OTP sent to your email'}
          {step === 'newPassword' && 'Create a new password for your account'}
        </p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
                placeholder="Enter your registered email"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              OTP sent to <span className="font-medium">{email}</span>
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
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="flex justify-between text-sm">
              <button 
                type="button" 
                onClick={() => setStep('email')} 
                className="text-gray-600 hover:text-gray-800"
              >
                ← Change Email
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

        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required
                placeholder="Min 6 characters"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required
                placeholder="Confirm your password"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password? <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
