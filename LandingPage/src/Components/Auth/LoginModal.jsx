// components/Auth/LoginModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Self-contained login modal with OTP email verification.
// • Gmail ID → Send OTP → 4-digit verify → Aadhaar + Password → Sign In → /map
// • Click backdrop / Escape / × to close
// • Body scroll locked while open
// • Fully responsive (mobile, tablet, desktop)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  LandPlot,
} from "lucide-react";

import InputField    from "./InputField";
import PasswordField from "./PasswordField";
import OtpField      from "./OtpField";
import {
  validateField,
  validateEmail,
  sanitizeAadhaar,
  validateLoginFields,
} from "./Validation";
import { sendOtp, verifyOtp } from "../../services/otpService";

// ─── LoginModal ───────────────────────────────────────────────────────────────

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  /* ── form state ── */
  const [formData, setFormData] = useState({
    email:        "",
    loginAadhaar: "",
    password:     "",
  });

  const [errors, setErrors] = useState({
    email:        "",
    loginAadhaar: "",
    password:     "",
  });

  const [showPassword, setShowPassword] = useState(false);

  /* ── OTP state ── */
  const [otpValue,    setOtpValue]    = useState("");
  const [otpSentCode, setOtpSentCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError,    setOtpError]    = useState("");
  const [isSending,   setIsSending]   = useState(false);

  const resetOtp = () => {
    setOtpValue("");
    setOtpSentCode("");
    setOtpVerified(false);
    setOtpError("");
    setIsSending(false);
  };

  /* ── debounce timers ── */
  const debounceTimers = useRef({});
  const DEBOUNCE_MS = 600;

  /* ── reset form whenever modal opens ── */
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: "", loginAadhaar: "", password: "" });
      setErrors({ email: "", loginAadhaar: "", password: "" });
      setShowPassword(false);
      resetOtp();
    }
  }, [isOpen]);

  /* ── lock body scroll while open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── close on Escape key ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ── handleChange with debounced validation ── */
  const handleChange = useCallback(
    (e) => {
      const { name } = e.target;
      let { value } = e.target;

      if (name === "loginAadhaar") value = sanitizeAadhaar(value);

      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));

      // Reset OTP if email changes
      if (name === "email") resetOtp();

      clearTimeout(debounceTimers.current[name]);
      debounceTimers.current[name] = setTimeout(() => {
        if (!value.trim()) return;
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }, DEBOUNCE_MS);
    },
    [] // eslint-disable-line
  );

  /* ── OTP: send ── */
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

  /* ── OTP: verify ── */
  const handleVerifyOtp = () => {
    if (verifyOtp(otpValue, otpSentCode)) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP. Please check and try again.");
    }
  };

  /* ── submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Block if OTP not verified
    if (!otpVerified) {
      setOtpError(
        otpSentCode
          ? "Please verify your OTP before signing in."
          : "Please send and verify the OTP first."
      );
      return;
    }

    const newErrors = validateLoginFields(formData);
    const loginErrors = {
      email:        newErrors.email,
      loginAadhaar: newErrors.loginAadhaar,
      password:     newErrors.password,
    };
    setErrors(loginErrors);

    const hasErrors = Object.values(loginErrors).some((err) => err !== "");
    if (hasErrors) return;

    console.log("Login submitted:", { email: formData.email });
    onClose();
    navigate("/map");
  };

  /* ── backdrop click handler ── */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const emailIsValid = validateEmail(formData.email) === "";

  /* ── don't render when closed ── */
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Login"
    >
      <div
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#f7f8f4] shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header strip ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e0e5e0]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f5c3a] text-white shadow">
              <LandPlot size={18} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-[#17251d]">SmartBhumi</p>
              <p className="text-[10px] uppercase tracking-[2px] text-[#718075]">Secure Sign In</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close login modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#718075] transition hover:bg-[#e8f0ea] hover:text-[#286044]"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ea] px-3 py-1.5 text-xs font-semibold text-[#286044]">
              <ShieldCheck size={13} />
              Secure citizen account
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#17251d]">Welcome back</h2>
            <p className="mt-1 text-sm text-[#718075]">
              Sign in to access your land records and services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Gmail ID */}
            <InputField
              label="Gmail ID"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              icon={<Mail size={17} />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* OTP */}
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

            {/* Aadhaar */}
            <InputField
              label="Aadhaar Number"
              name="loginAadhaar"
              placeholder="XXXX XXXX XXXX"
              icon={<Fingerprint size={17} />}
              value={formData.loginAadhaar}
              onChange={handleChange}
              error={errors.loginAadhaar}
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

            {/* Submit — disabled until OTP verified */}
            <button
              type="submit"
              disabled={!otpVerified}
              className={`group flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white shadow-sm transition mt-2
                ${otpVerified
                  ? "bg-[#286044] hover:bg-[#1e4e35] hover:shadow-md active:scale-[0.99]"
                  : "bg-[#7aaa8f] cursor-not-allowed"
                }`}
            >
              Sign In
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>

            {/* OTP hint */}
            {!otpVerified && (
              <p className="text-center text-[11px] text-[#718075]">
                Verify your email OTP to enable sign in.
              </p>
            )}

            {/* Switch to signup */}
            <div className="flex items-center justify-center gap-1 pt-1 text-xs text-[#718075]">
              <span>Don&apos;t have an account?</span>
              <button
                type="button"
                onClick={() => { onClose(); navigate("/auth?tab=signup"); }}
                className="font-bold text-[#286044] hover:underline"
              >
                Create account
              </button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e5e0] text-[10px] text-[#8a958e]">
          <span>© 2026, All Rights Reserved by Sp</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} />
            Your data is protected
          </span>
        </div>
      </div>
    </div>
  );
}
