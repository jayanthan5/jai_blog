import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, changePassword, requestPasswordReset, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const [resetEmailStatus, setResetEmailStatus] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    setIsChanging(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPasswordStatus(res);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordStatus({ success: false, message: err.message || 'Password update failed' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const res = await requestPasswordReset(user.email);
      setResetEmailStatus(res.message);
      setTimeout(() => setResetEmailStatus(null), 6000);
    } catch (err: any) {
      setResetEmailStatus(err.message || 'Failed to dispatch reset link');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
          Administrator Profile &amp; Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system administrator credentials, two-factor authentication parameters, and password policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-1 h-fit">
          <div className="w-16 h-16 rounded-2xl bg-[#3368a0] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-[#3368a0]/20 mx-auto">
            J
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-[#0f172a]">{user?.name || 'Jai Administrator'}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email || 'admin@jaiblog.com'}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Super Administrator</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Policy:</span>
              <span className="font-semibold">Single-Admin (PRD Rule 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">2FA Method:</span>
              <span className="font-semibold">Email 6-digit OTP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Session Max:</span>
              <span className="font-semibold">30 mins (AUTH-05)</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session &amp; Logout</span>
          </button>
        </div>

        {/* Security & Password Reset Column */}
        <div className="space-y-6 md:col-span-2">
          {/* Change Password Form (DASH-04 & TRD Section 9.4) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
              <KeyRound className="w-4 h-4 text-[#3368a0]" />
              <span>Change Administrator Password</span>
            </div>

            {passwordStatus && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  passwordStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (Demo: Admin@123)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChanging}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isChanging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Email Reset Link Simulation (TRD Section 9.4 & Rule 6: 1-hour expiry) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                <Clock className="w-4 h-4 text-[#3368a0]" />
                <span>Password Reset Link Via Email (1-Hour Expiry)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Rule 6
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Dispatches a cryptographically signed password reset token to <strong className="text-slate-800">{user?.email}</strong>. Per TRD specification, the link automatically expires after 1 hour.
            </p>

            {resetEmailStatus && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3368a0]" />
                <span>{resetEmailStatus}</span>
              </div>
            )}

            <button
              onClick={handleSendResetLink}
              disabled={isSendingReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#3368a0]" />
              <span>{isSendingReset ? 'Dispatching Email...' : 'Send Reset Link to Registered Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
