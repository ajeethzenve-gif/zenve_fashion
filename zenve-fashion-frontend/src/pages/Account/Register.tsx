import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await register({ name, email, phone, password });
    if (success) {
      navigate('/account');
    }
  };

  return (
    <div className="w-full bg-[#002B1D] min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-[#001C13] border border-[#E4BD5A]/30 p-8 sm:p-10 space-y-6 text-left shadow-2xl">
        <div className="text-center space-y-2">
          <img src="/logo/zenve-logo.png" alt="ZENVE" className="h-12 w-auto mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Register with Zenve</h1>
          <p className="text-xs text-[#B8B9A8]">Join our private circle of luxury fashion connoisseurs.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                placeholder="Maharaja Vikramaditya"
              />
            </div>
          </div>

          <div>
            <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                placeholder="vasanth@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                placeholder="+91 98450 12345"
              />
            </div>
          </div>

          <div>
            <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
              Create Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'ENROLLING...' : 'CREATE ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E4BD5A]/15 text-center text-xs">
          <p className="text-[#B8B9A8]">
            Already an atelier member?{' '}
            <Link to="/login" className="text-[#E4BD5A] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
