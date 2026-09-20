// components/Auth/OtpField.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable OTP verification block.
//
// Props:
//   email          {string}   – current email field value (controls button state)
//   emailValid     {boolean}  – true when email passes format validation
//   otpValue       {string}   – controlled 4-digit OTP string
//   onOtpChange    {Function} – (value: string) => void
//   otpVerified    {boolean}  – true after successful verification
//   otpError       {string}   – error message to display under the field
//   onSendOtp      {Function} – called when "Send OTP" is clicked  (async)
//   onVerifyOtp    {Function} – called when "Verify" is clicked
//   isSending      {boolean}  – true while the sendOtp network call is in flight
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const COUNTDOWN_SECONDS = 10; // 2 minutes

export default function OtpField({
  email,
  emailValid,
  otpValue,
  onOtpChange,
  otpVerified,
  otpError,
  onSendOtp,
  onVerifyOtp,
  isSending,
}) {
  // Whether the OTP has been sent at least once in this session
  const [otpSent, setOtpSent] = useState(false);

  // Countdown state
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // ── Start / restart the 2-minute countdown ──────────────────────────────
  const startCountdown = () => {
    clearInterval(timerRef.current);
    setSecondsLeft(COUNTDOWN_SECONDS);

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Clean up timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Format mm:ss ────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Send OTP handler ────────────────────────────────────────────────────
  const handleSend = async () => {
    await onSendOtp();
    setOtpSent(true);
    startCountdown();
  };

  // ── Resend handler ──────────────────────────────────────────────────────
  const handleResend = async () => {
    onOtpChange(""); // clear current input
    await onSendOtp();
    startCountdown();
  };

  // ── Derived UI flags ────────────────────────────────────────────────────
  const canSend     = emailValid && !isSending;
  const canResend   = otpSent && secondsLeft === 0 && !otpVerified && !isSending;
  const showTimer   = otpSent && secondsLeft > 0 && !otpVerified;
  const showVerify  = otpSent && !otpVerified;

  // ── OTP digit-only input sanitiser (max 4 chars) ────────────────────────
  const handleOtpInput = (e) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
    onOtpChange(clean);
  };

  return (
    <div className="space-y-2">
      {/* ── Row: OTP input + action button ── */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#314139]">
          Email OTP
        </label>

        <div className="flex gap-2">
          {/* 4-digit OTP input */}
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={otpValue}
              onChange={handleOtpInput}
              disabled={otpVerified || !otpSent}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition placeholder:text-[#9aa59e] placeholder:tracking-[0.3em] placeholder:text-base
                focus:ring-2
                ${
                  otpVerified
                    ? "border-[#2e7d52] bg-[#318155] text-[#2da362] focus:ring-[#2e7d52]/10"
                    : otpError
                      ? "border-[#d94040] text-[#d94040] focus:border-[#d94040] focus:ring-[#d94040]/10"
                      : "border-[#d5ddd7] text-[#17251d] focus:border-[#3d7956] focus:ring-[#3d7956]/10"
                }
                disabled:opacity-60 disabled:cursor-not-allowed`}
            />

            {/* Verified tick overlay */}
            {otpVerified && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2e7d52]">
                <ShieldCheck size={16} />
              </div>
            )}

            {/* Error icon overlay */}
            {otpError && !otpVerified && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#d94040]">
                <AlertCircle size={16} />
              </div>
            )}
          </div>

          {/* Send / Verify button */}
          {!otpVerified && (
            <button
              type="button"
              onClick={showVerify ? onVerifyOtp : handleSend}
              disabled={showVerify ? otpValue.length < 4 : !canSend}
              className={`h-11 min-w-[90px] rounded-lg px-4 text-xs font-bold transition whitespace-nowrap
                ${
                  showVerify
                    ? "bg-[#286044] text-white hover:bg-[#1e4e35] disabled:opacity-50 disabled:cursor-not-allowed"
                    : canSend
                      ? "bg-[#e7eae7] text-[#286044] hover:bg-[#d4e8da]"
                      : "bg-[#e7eae7] text-[#9aa59e] cursor-not-allowed"
                }`}
            >
              {isSending ? (
                <Loader2 size={15} className="mx-auto animate-spin" />
              ) : showVerify ? (
                "Verify"
              ) : (
                "Send OTP"
              )}
            </button>
          )}

          {/* Verified badge (replaces button after success) */}
          {otpVerified && (
            <div className="flex h-11 min-w-[90px] items-center justify-center gap-1.5 rounded-lg bg-[#dcfce8] px-3 text-xs font-bold text-[#2e7d52]">
              <ShieldCheck size={13} />
              Verified
            </div>
          )}
        </div>
      </div>

      {/* ── Below-input row: error / timer / resend ── */}
      <div className="flex items-center justify-between min-h-[18px]">
        {/* Error message */}
        {otpError && !otpVerified && (
          <p className="text-[11px] font-medium text-[#d94040]">{otpError}</p>
        )}

        {/* Verified message */}
        {otpVerified && (
          <p className="text-[11px] font-medium text-[#2e7d52]">
            ✓ OTP verified successfully
          </p>
        )}

        {/* Empty placeholder so row keeps height */}
        {!otpError && !otpVerified && <span />}

        {/* Right side: timer OR resend */}
        <div className="ml-auto">
          {showTimer && (
            <span className="text-[11px] text-[#718075] tabular-nums">
              Resend in{" "}
              <span className="font-semibold text-[#314139]">
                {formatTime(secondsLeft)}
              </span>
            </span>
          )}

          {canResend && (
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#286044] hover:underline"
            >
              <RefreshCw size={11} />
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
