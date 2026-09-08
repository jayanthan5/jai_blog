import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Inbox,
  Copy,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const { 
    login, 
    verifyOtp, 
    pendingOtp, 
    clearPendingOtp, 
    resendOtp 
  } = useAuth();

  // Form State
  const [name, setName] = useState('Jai Administrator');
  const [email, setEmail] = useState('admin@jaiblog.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State (6 individual digit inputs)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(300);
  const [copiedCode, setCopiedCode] = useState(false);

  // Timer for pending OTP
  useEffect(() => {
    if (!pendingOtp) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((pendingOtp.expiresAt - Date.now()) / 1000));
      setOtpSecondsLeft(remaining);
      if (remaining <= 0) {
        setOtpError('This OTP has expired. Please request a new code.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingOtp]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await login(name, email, password);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        // Reset OTP inputs
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError(null);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // Pasted full code
      const chars = clean.slice(0, 6).split('');
      chars.forEach((c, i) => {
        newDigits[i] = c;
      });
      setOtpDigits(newDigits);
      // Focus last or next
      const nextInput = document.getElementById(`otp-input-${Math.min(5, chars.length)}`);
      nextInput?.focus();
      return;
    }

    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await verifyOtp(code);
      if (res.success) {
        onLoginSuccess();
      } else {
        setOtpError(res.message);
      }
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAutofill = () => {
    if (pendingOtp) {
      const chars = pendingOtp.code.split('');
      setOtpDigits(chars);
      setOtpError(null);
    }
  };

  const copyOtpToClipboard = () => {
    if (pendingOtp) {
      navigator.clipboard.writeText(pendingOtp.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#3368a0] flex items-center justify-center text-white mx-auto shadow-md shadow-[#3368a0]/25">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          {pendingOtp ? 'Two-Factor Authentication' : 'Jai-Blog Admin Portal'}
        </h2>

        <p className="mt-2 text-center text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {pendingOtp
            ? `Enter the 6-digit OTP code dispatched to ${pendingOtp.email}`
            : 'Enter credentials to trigger multi-factor email verification'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10">
          {!pendingOtp ? (
            /* ========================================================= */
            /* STEP 1: LOGIN CREDENTIALS FORM (AUTH-01 & AUTH-02)       */
            /* ========================================================= */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Name (AUTH-01) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all"
                    placeholder="Administrator name"
                  />
                </div>
              </div>

              {/* Email (AUTH-01) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all"
                    placeholder="admin@jaiblog.com"
                  />
                </div>
              </div>

              {/* Password (AUTH-01) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Quick-Fill Pill */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#3368a0] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Demo Credentials Pre-filled:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setName('Jai Administrator');
                      setEmail('admin@jaiblog.com');
                      setPassword('Admin@123');
                    }}
                    className="text-[11px] font-bold text-[#3368a0] hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Email: <code className="text-slate-800 font-mono">admin@jaiblog.com</code> | Password: <code className="text-slate-800 font-mono">Admin@123</code>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to 2FA OTP Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Return to Public Reader
              </button>
            </form>
          ) : (
            /* ========================================================= */
            /* STEP 2: 2FA OTP VERIFICATION (AUTH-03 & AUTH-04 & AC-02)  */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Simulated Email Notification Card (Gives instant access to OTP) */}
              <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-sky-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Inbox className="w-4 h-4" />
                    Dispatched Email Inbox
                  </span>
                  <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full">
                    Nodemailer / SMTP (TRD Section 4)
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  To: <span className="font-mono text-white">{pendingOtp.email}</span>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-lg flex items-center justify-between border border-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                      Your 6-Digit OTP Code
                    </div>
                    <div className="font-mono text-2xl font-black text-amber-400 tracking-widest mt-0.5">
                      {pendingOtp.code}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleQuickAutofill}
                      type="button"
                      className="px-2.5 py-1.5 bg-[#3368a0] hover:bg-[#285584] text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Autofill Code
                    </button>
                    <button
                      onClick={copyOtpToClipboard}
                      type="button"
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {copiedCode && (
                  <p className="text-[10px] text-emerald-400 font-medium text-center">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6 Digit Input Fields */}
              <div>
                <label className="block text-xs font-bold text-center text-slate-700 mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center items-center gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-slate-50 border-2 border-slate-300 focus:border-[#3368a0] focus:bg-white rounded-xl focus:ring-0 focus:outline-hidden transition-all text-[#0f172a]"
                    />
                  ))}
                </div>
              </div>

              {/* Expiry Countdown (AUTH-03: 5 mins) */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expires in:</span>
                  <span className="font-mono font-bold text-[#0f172a]">
                    {Math.floor(otpSecondsLeft / 60)}:
                    {(otpSecondsLeft % 60).toString().padStart(2, '0')}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-xs font-semibold text-[#3368a0] hover:underline"
                >
                  Resend Code
                </button>
              </div>

              {/* Verify Button (AUTH-04) */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleVerifyOtpSubmit()}
                  disabled={isSubmitting || otpDigits.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating 2FA OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify &amp; Enter Admin Dashboard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearPendingOtp}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
                >
                  ← Back to Email &amp; Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
