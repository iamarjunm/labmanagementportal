"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Grainient from '@/components/Grainient';

const floatingAnimation = `
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
`;

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Login failed');
      }

      router.replace('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx>{floatingAnimation}</style>
      <div className="relative min-h-screen overflow-hidden">
      {/* Grainient Background */}
      <div className="absolute inset-0">
        <Grainient
          color1="#ef8c44"
          color2="#f45e3f"
          color3="#ded4e8"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.09}
          rotationAmount={560}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Header Text */}
        <div className="absolute top-12 left-0 right-0 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
            Manipal University Jaipur
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-white/90 mt-2" style={{ fontFamily: '"Poppins", sans-serif', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            Lab Management System
          </p>
        </div>
        
        <div className="w-full max-w-md mt-8">
          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-float">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>Welcome Back</h1>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-700 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                <p className="text-red-700 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>Signing in...</p>
                  </span>
                ) : (
                <p style={{ fontFamily: '"Poppins", sans-serif' }}>Sign in</p>
                )}
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2 text-xs text-gray-500 text-center">
                <p style={{ fontFamily: '"Poppins", sans-serif' }}>No registration required</p>
                <p style={{ fontFamily: '"Poppins", sans-serif' }}>Credentials are created by super admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
