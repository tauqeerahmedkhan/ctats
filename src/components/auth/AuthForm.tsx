import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Clock, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const { signIn, signUp, error } = useDatabase();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setLocalError(error.message);
      } else if (isSignUp) {
        setLocalError('Check your email for a confirmation link');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-navy-600 p-3 rounded-full">
              <Clock className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Employee Attendance Tracker
          </h1>
          <p className="text-gray-600">
            Sign in to manage your attendance system
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {(error || localError) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error || localError}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              icon={isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError(null);
                }}
                className="text-sm text-navy-600 hover:text-navy-700 font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure attendance management powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};