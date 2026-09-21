// frontend/src/components/Auth/OtpField.jsx
import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const COUNTDOWN_SECONDS = 120; // 2 minutes

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
  const [otpSent, setOtpSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // Start / restart countdown timer
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

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSend = async () => {
    await onSendOtp();
    setOtpSent(true);
    startCountdown();
  };

  const handleResend = async () => {
    onOtpChange("");
    await onSendOtp();
    startCountdown();
  };

  const canSend = emailValid && !isSending;
  const canResend = otpSent && secondsLeft === 0 && !otpVerified && !isSending;
  const showTimer = otpSent && secondsLeft > 0 && !otpVerified;
  const showVerify = otpSent && !otpVerified;

  const handleOtpInput = (e) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
    onOtpChange(clean);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#314139] dark:text-[#cbd5e1]">
          Email OTP
        </label>

        <div className="flex gap-2">
          {/* 4-digit OTP input */}
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={otpValue || ""}
              onChange={handleOtpInput}
              disabled={otpVerified || !otpSent}
              className={`h-11 w-full rounded-lg border bg-white dark:bg-[#16221c] px-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition placeholder:text-[#9aa59e] dark:placeholder:text-[#64748b] placeholder:tracking-[0.3em] placeholder:text-base focus:ring-2 ${
                otpVerified
                  ? "border-[#2e7d52] dark:border-emerald-600 bg-[#f0fdf4] dark:bg-[#14261c] text-[#286044] dark:text-[#86efac] focus:ring-[#2e7d52]/10"
                  : otpError
                    ? "border-[#d94040] text-[#d94040] focus:border-[#d94040] focus:ring-[#d94040]/10"
                    : "border-[#d5ddd7] dark:border-[#2b3d33] text-[#17251d] dark:text-[#f1f5f9] focus:border-[#3d7956] dark:focus:border-[#52b788] focus:ring-[#3d7956]/10"
              } disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:bg-[#111a15]`}
            />

            {/* Verified tick overlay */}
            {otpVerified && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2e7d52] dark:text-[#86efac]">
                <ShieldCheck size={18} />
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
              disabled={showVerify ? (otpValue || "").length < 4 : !canSend}
              className={`h-11 min-w-[95px] rounded-lg px-3.5 text-xs font-bold transition whitespace-nowrap ${
                showVerify
                  ? "bg-[#286044] dark:bg-[#1e5c3c] text-white hover:bg-[#1e4e35] dark:hover:bg-[#286044] disabled:cursor-not-allowed disabled:opacity-50"
                  : canSend
                    ? "bg-[#e8f0ea] dark:bg-[#1c2e24] text-[#286044] dark:text-[#86efac] hover:bg-[#d8e6db] dark:hover:bg-[#253e30]"
                    : "cursor-not-allowed bg-[#e7eae7] dark:bg-[#141f19] text-[#9aa59e] dark:text-[#475569]"
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

          {/* Verified badge (replaces button) */}
          {otpVerified && (
            <div className="flex h-11 min-w-[95px] items-center justify-center gap-1.5 rounded-lg bg-[#dcfce7] dark:bg-[#14261c] px-3 text-xs font-bold text-[#2e7d52] dark:text-[#86efac] border border-transparent dark:border-emerald-800/40">
              <ShieldCheck size={14} />
              Verified
            </div>
          )}
        </div>
      </div>

      {/* Status row: error / timer / resend */}
      <div className="flex items-center justify-between min-h-[18px]">
        {otpError && !otpVerified && (
          <p className="text-[11px] font-medium text-[#d94040]">{otpError}</p>
        )}

        {otpVerified && (
          <p className="text-[11px] font-medium text-[#2e7d52] dark:text-[#86efac]">
            ✓ OTP verified successfully
          </p>
        )}

        {!otpError && !otpVerified && <span />}

        <div className="ml-auto">
          {showTimer && (
            <span className="text-[11px] text-[#718075] dark:text-[#94a3b8] tabular-nums">
              Resend in{" "}
              <span className="font-semibold text-[#314139] dark:text-white">
                {formatTime(secondsLeft)}
              </span>
            </span>
          )}

          {canResend && (
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#286044] dark:text-[#86efac] hover:underline"
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
