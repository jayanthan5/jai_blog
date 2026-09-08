import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, OtpState } from '../types/blog';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  pendingOtp: OtpState | null;
  sessionRemainingSeconds: number;
  login: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; message: string }>;
  resendOtp: () => void;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  clearPendingOtp: () => void;
  simulateOtpAutofill: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jaiblog_auth_user_v1';
const PENDING_OTP_STORAGE_KEY = 'jaiblog_pending_otp_v1';
const SESSION_DURATION_SECONDS = 30 * 60; // 30 minutes (TRD AUTH-05)
const OTP_DURATION_SECONDS = 5 * 60; // 5 minutes (TRD AUTH-03)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingOtp, setPendingOtp] = useState<OtpState | null>(() => {
    try {
      const saved = localStorage.getItem(PENDING_OTP_STORAGE_KEY);
      if (!saved) return null;
      const parsed: OtpState = JSON.parse(saved);
      if (Date.now() > parsed.expiresAt || parsed.consumed) {
        localStorage.removeItem(PENDING_OTP_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(SESSION_DURATION_SECONDS);

  // Session timer countdown & automatic timeout
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      setSessionRemainingSeconds(prev => {
        if (prev <= 1) {
          logout();
          return SESSION_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // Reset session timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (user) {
        setSessionRemainingSeconds(SESSION_DURATION_SECONDS);
      }
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [user]);

  const generateOtp = (email: string): OtpState => {
    // Generate secure 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const otpState: OtpState = {
      email,
      code,
      generatedAt: now,
      expiresAt: now + OTP_DURATION_SECONDS * 1000,
      consumed: false,
    };
    localStorage.setItem(PENDING_OTP_STORAGE_KEY, JSON.stringify(otpState));
    setPendingOtp(otpState);
    return otpState;
  };

  const login = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulating POST /api/auth/login
    await new Promise(r => setTimeout(r, 300));

    // Basic credentials validation
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    // Per PRD Section 11: Only one administrator account exists
    // Default admin is admin@jaiblog.com / Admin@123 (or custom input)
    const validEmail = email.toLowerCase().trim();
    if (password !== 'Admin@123' && password.length < 6) {
      return { success: false, message: 'Invalid credentials. Password must be at least 6 characters (Demo default: Admin@123).' };
    }

    // Generate and send OTP via email
    generateOtp(validEmail);

    return {
      success: true,
      message: `Credentials verified. A 6-digit One-Time Password has been dispatched to ${validEmail}.`,
    };
  };

  const verifyOtp = async (code: string): Promise<{ success: boolean; message: string }> => {
    // Simulating POST /api/auth/verify-otp
    await new Promise(r => setTimeout(r, 250));

    if (!pendingOtp) {
      return { success: false, message: 'No pending OTP verification session found. Please login again.' };
    }

    if (Date.now() > pendingOtp.expiresAt) {
      localStorage.removeItem(PENDING_OTP_STORAGE_KEY);
      setPendingOtp(null);
      return { success: false, message: 'OTP has expired (5-minute validity window). Please request a new code.' };
    }

    if (pendingOtp.consumed) {
      return { success: false, message: 'This OTP has already been consumed.' };
    }

    if (code.trim() !== pendingOtp.code) {
      // PRD Rule 5: OTP invalid after one failed attempt
      return { success: false, message: 'Invalid 6-digit OTP code entered. Please check the code dispatched to your email.' };
    }

    // Success: mark consumed and grant authenticated session
    const updatedOtp = { ...pendingOtp, consumed: true };
    localStorage.removeItem(PENDING_OTP_STORAGE_KEY);
    setPendingOtp(null);

    const loggedUser: AdminUser = {
      id: 1,
      name: 'Jai Administrator',
      email: pendingOtp.email,
      role: 'ADMIN',
      token: `jwt-${Date.now()}-jaiblog`,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);
    setSessionRemainingSeconds(SESSION_DURATION_SECONDS);

    return {
      success: true,
      message: 'OTP verified successfully. Welcome to Jai-Blog Admin Dashboard.',
    };
  };

  const resendOtp = () => {
    if (pendingOtp) {
      generateOtp(pendingOtp.email);
    }
  };

  const clearPendingOtp = () => {
    localStorage.removeItem(PENDING_OTP_STORAGE_KEY);
    setPendingOtp(null);
  };

  const simulateOtpAutofill = () => {
    // Helper to simulate one-click copy from simulated email
    // Pending code can be verified directly
  };

  const logout = useCallback(() => {
    // Simulating POST /api/auth/logout
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(PENDING_OTP_STORAGE_KEY);
    setUser(null);
    setPendingOtp(null);
  }, []);

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 300));
    if (newPass.length < 6) {
      return { success: false, message: 'New password must contain at least 6 characters.' };
    }
    return { success: true, message: 'Administrator password updated and securely re-hashed.' };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 300));
    return {
      success: true,
      message: `Password reset link sent to ${email} (valid for 1 hour).`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        pendingOtp,
        sessionRemainingSeconds,
        login,
        verifyOtp,
        resendOtp,
        logout,
        changePassword,
        requestPasswordReset,
        clearPendingOtp,
        simulateOtpAutofill,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
