import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import floodBg from '../assets/Manila_JPEPhotography.jpg';
import mdrrmdLogo from '../assets/mdrrmd_logo.png';
import likasLogo from '../assets/likas_logo_2.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="hidden md:flex w-[44%] bg-[#050A30] flex-col items-center justify-center p-12 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${floodBg})` }}
      >
      <div className="absolute inset-0 bg-[#050A30]/80" /> 
        <div className="bg-white/10 rounded-2xl pt-15 p-10 flex flex-col items-start gap-6 border border-white/10 backdrop-blur-xs">
          <div className= "flex flex-row gap-4">
            <div className="w-22 h-22 bg-white rounded-full flex items-center justify-center shadow-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${mdrrmdLogo})` }}>
            </div>
            <div className="w-22 h-22 bg-none rounded-full flex items-center justify-center shadow-2xl bg-cover bg-center"
            style={{ backgroundImage: `url(${likasLogo})` }}>
            </div>
          </div>
          <div className="text-left cursor-default">
            <h1 className="text-white font-heading font-bold text-5xl tracking-wide">LIKAS</h1>
            <p className="text-white font-inter font-medium text-base leading-relaxed max-w-[400px]">
              A Flood Vulnerability Decision Support System
            </p>
            <h3 className="text-white font-heading font-inter font-semibold text-base tracking-wide mt-4">City of Manila</h3>
            <p className="text-white font-inter text-base leading-relaxed  max-w-[350px]">
              Disaster Risk Reduction and Management Department
            </p>
          </div>
          <p className="text-gray-300 text-sm font-inter font-medium mt-10 cursor-pointer w-full">
            Version 1.0.0
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-[#F0F4F7] flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#050A30] rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold">L</span>
            </div>
            <span className="font-heading font-bold text-[#050A30] text-2xl">LIKAS</span>
          </div>

          <div className="cursor-default bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className="font-heading font-bold text-gray-900 text-2xl">Welcome Back</h2>
              <p className="text-sm font-inter text-gray-500 mt-1">Sign in with your registered account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-inter font-medium text-gray-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.gov.ph"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-inter font-medium text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-[#C62828] font-inter">{error}</p>
                </div>
              )}

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                  className="group relative w-full py-3.5 bg-[#050A30] disabled:opacity-60 text-white font-heading font-bold text-sm rounded-xl transition-all duration-200 mt-2 shadow-sm hover:shadow-md overflow-hidden"
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-0 h-0 rounded-full bg-white/20 group-hover:w-[400px] group-hover:h-[300px] transition-all duration-300 group-hover:shadow group-hover:s ease-out" />
                </span>
                <span className="relative z-10">
                  {loading ? 'Signing in...' : 'LOGIN'}
                </span>
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#F0F4F7] rounded-xl">
              <p className="text-xs font-inter text-gray-500 font-medium mb-2">Demo accounts:</p>
              <div className="space-y-1">
                <p className="text-xs font-inter text-gray-400">
                  <span className="text-gray-600 font-medium">Barangay:</span> manila.brgy-676@gov.ph / Password123!
                </p>
                <p className="text-xs font-inter text-gray-400">
                  <span className="text-gray-600 font-medium">Admin:</span> manila.mdrrmo@gov.ph / Mdrrmo2026!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
