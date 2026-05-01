import React from 'react';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

const Login: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Firebase configuration not found. Please check your Netlify environment variables.');
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        const activeProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Unknown';
        const activeAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Unknown';
        setError(`Domain (${currentDomain}) unauthorized. 
          Project: ${activeProjectId}
          AuthDomain: ${activeAuthDomain}
          Please check if Netlify Env Vars are correct and NOT marked as "Secret".`);
      } else {
        setError(err.message || 'Login failed. Please check your configuration.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-slate-100 rounded-[48px] p-12 shadow-2xl shadow-slate-100 text-center overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-sky-400" />
        
        <div className="mb-12 flex justify-center">
          <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-inner group transition-all">
             <img 
               src="https://ais-pre-7th2hnfipjlehdlyo5pyyk-698513171403.asia-southeast1.run.app/artifact/eternalgy-logo.png" 
               alt="Eternalgy" 
               className="h-10 w-auto brightness-0 opacity-80 group-hover:opacity-100 transition-opacity" 
             />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Sales Pro</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
          The ultimate sales and commission tracking system for Eternalgy partners.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium leading-relaxed">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-white border-2 border-slate-100 text-slate-900 font-black py-5 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-sm shadow-slate-100"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" />
          Sign in with Google
        </button>
        
        <div className="mt-12 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">
            Powered by Eternal Energy
          </p>
          <div className="w-8 h-1 bg-indigo-500/20 mx-auto rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
