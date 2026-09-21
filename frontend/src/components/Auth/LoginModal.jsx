// frontend/src/components/Auth/LoginModal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  LandPlot,
  Zap,
} from "lucide-react";

import InputField from "./InputField";
import PasswordField from "./PasswordField";
import OtpField from "./OtpField";
import ThemeToggle from "../ThemeToggle";
import {
  validateField,
  validateEmail,
  sanitizeAadhaar,
  validateLoginFields,
} from "./Validation";
import { sendOtp, verifyOtp } from "../../services/otpService";
import { useAuth } from "../../hooks/useAuthContext";
import authStore from "../../store/authStore";

const DEBOUNCE_MS = 400;

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    loginAadhaar: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    loginAadhaar: "",
    password: "",
  });

  // OTP state
  const [otpValue, setOtpValue] = useState("");
  const [otpSentCode, setOtpSentCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const debounceTimers = useRef({});

  const resetOtp = () => {
    setOtpValue("");
    setOtpSentCode("");
    setOtpVerified(false);
    setOtpError("");
    setIsSending(false);
  };

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const handleChange = useCallback(
    (e) => {
      const { name } = e.target;
      let { value } = e.target;

      if (name === "loginAadhaar") value = sanitizeAadhaar(value);

      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setGeneralError("");

      // Reset OTP if email changes
      if (name === "email") resetOtp();

      clearTimeout(debounceTimers.current[name]);
      debounceTimers.current[name] = setTimeout(() => {
        if (!value.trim()) return;
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }, DEBOUNCE_MS);
    },
    []
  );

  const handleSendOtp = async () => {
    setIsSending(true);
    setOtpError("");
    try {
      const code = await sendOtp(formData.email);
      setOtpSentCode(code);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const isValid = await verifyOtp(otpValue, otpSentCode, formData.email);
    if (isValid) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP code. Please check and try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!otpVerified) {
      setOtpError(
        otpSentCode
          ? "Please verify your OTP before signing in."
          : "Please send and verify the OTP first."
      );
      return;
    }

    const newErrors = validateLoginFields(formData);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) return;

    setSubmitting(true);
    try {
      await login(formData.email, formData.password, {
        aadhaar: formData.loginAadhaar,
      });

      authStore.setLoggedInUser({
        email: formData.email,
        aadhaar: formData.loginAadhaar,
      });

      onClose();
      navigate("/dashboard");
    } catch (err) {
      setGeneralError(
        err.message || err.response?.data?.error || "Login failed. Check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo account auto-fill
  const fillDemoUser = (demoEmail, demoPw, demoAadhaar = "9876 5432 1098") => {
    setFormData({
      email: demoEmail,
      loginAadhaar: demoAadhaar,
      password: demoPw,
    });
    setOtpVerified(true);
    setOtpValue("1234");
    setOtpSentCode("1234");
    setOtpError("");
    setErrors({ email: "", loginAadhaar: "", password: "" });
    setGeneralError("");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const emailIsValid = validateEmail(formData.email) === "";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0, 0, 0, 0.48)",
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Secure Sign In"
    >
      <div
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#f7f8f4] dark:bg-[#111a15] text-[#17251d] dark:text-[#f1f5f9] shadow-2xl ring-1 ring-black/10 dark:ring-white/10 dark:border dark:border-[#22362b] animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e0e5e0] dark:border-[#1e2f25]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f5c3a] text-white shadow">
              <LandPlot size={18} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-[#17251d] dark:text-white">
                SmartBhumi
              </p>
              <p className="text-[10px] uppercase tracking-[1.5px] text-[#718075] dark:text-slate-400">
                Secure Sign In
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              aria-label="Close login modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#718075] dark:text-[#94a3b8] transition hover:bg-[#e8f0ea] dark:hover:bg-[#1c2e24] hover:text-[#286044] dark:hover:text-[#52b788]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ea] dark:bg-[#172d21] px-3 py-1 text-xs font-semibold text-[#286044] dark:text-emerald-400 border border-transparent dark:border-emerald-800/40">
              <ShieldCheck size={13} />
              Secure citizen account
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#17251d] dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-[#718075] dark:text-slate-400">
              Sign in to access your land records, maps and citizen services.
            </p>
          </div>

          {generalError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Email */}
            <InputField
              label="Gmail ID / Email"
              name="email"
              type="email"
              placeholder="citizen@demo.com"
              icon={<Mail size={16} />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            {/* OTP Field */}
            <OtpField
              email={formData.email}
              emailValid={emailIsValid}
              otpValue={otpValue}
              onOtpChange={setOtpValue}
              otpVerified={otpVerified}
              otpError={otpError}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              isSending={isSending}
            />

            {/* Aadhaar Number */}
            <InputField
              label="Aadhaar Number"
              name="loginAadhaar"
              placeholder="XXXX XXXX XXXX"
              icon={<Fingerprint size={16} />}
              value={formData.loginAadhaar}
              onChange={handleChange}
              error={errors.loginAadhaar}
              maxLength={14}
            />

            {/* Password */}
            <PasswordField
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSignUp={false}
              error={errors.password}
            />

            {/* Quick Demo Logins Helper */}
            <div className="pt-1 border-t border-slate-100 dark:border-[#1e2f25]">
              <div className="flex items-center justify-between text-[11px] text-[#718075] dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Zap size={12} className="text-amber-500" /> Demo Quick Fills:
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">1-click test</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemoUser("citizen@demo.com", "Citizen@123")}
                  className="rounded-md bg-emerald-50 dark:bg-[#152a1e] border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1d3829] transition"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoUser("revenue@wb.gov", "Officer@123")}
                  className="rounded-md bg-slate-100 dark:bg-[#1b2720] border border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#25362d] transition"
                >
                  Revenue Officer
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoUser("admin@landstack.gov", "Admin@123")}
                  className="rounded-md bg-amber-50 dark:bg-[#272113] border border-amber-200 dark:border-amber-800/50 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-[#382e1b] transition"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!otpVerified || submitting}
              className={`group flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white shadow-sm transition mt-2 ${
                otpVerified && !submitting
                  ? "bg-[#286044] hover:bg-[#1e4e35] hover:shadow-md active:scale-[0.99]"
                  : "bg-[#7aaa8f] dark:bg-[#244234] cursor-not-allowed opacity-70"
              }`}
            >
              {submitting ? "Signing In…" : "Sign In"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            {!otpVerified && (
              <p className="text-center text-[11px] text-[#718075] dark:text-slate-400">
                Verify your email OTP to enable sign in.
              </p>
            )}

            {/* Switch to Signup */}
            <div className="flex items-center justify-center gap-1 pt-1 text-xs text-[#718075] dark:text-slate-400">
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/auth?tab=signup");
                }}
                className="font-bold text-[#286044] dark:text-emerald-400 hover:underline"
              >
                Create account
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#e0e5e0] dark:border-[#1e2f25] text-[10px] text-[#8a958e] dark:text-slate-400">
          <span>© 2026 SmartBhumi Prototype</span>
          <span className="flex items-center gap-1 text-[#286044] dark:text-emerald-400 font-medium">
            <ShieldCheck size={12} /> Data is protected
          </span>
        </div>
      </div>
    </div>
  );
}
