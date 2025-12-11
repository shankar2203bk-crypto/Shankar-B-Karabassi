import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Lock, Mail } from 'lucide-react';
import Logo from './Logo';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in w-full px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Decorative background glow inside card */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>

            {/* Header / Logo */}
            <div className="text-center mb-8 relative z-10">
                 <div className="flex justify-center mb-6">
                    <Logo className="w-28 h-28 drop-shadow-xl" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">
                    {isSignUp ? 'Create an Account' : 'Welcome'}
                 </h2>
                 <p className="text-slate-400 text-sm">
                    {isSignUp ? 'Join ForgeIQ to master LLMs' : 'Sign in to access your prompt workspace'}
                 </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                
                <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-500" />
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-500" />
                        </div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                             {isSignUp ? <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                             {isSignUp ? 'Create Account' : 'Sign In'}
                        </>
                    )}
                </button>
            </form>

            {/* Footer toggle */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-center relative z-10">
                <p className="text-slate-400 text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
            This is a demo application. No data is stored.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;