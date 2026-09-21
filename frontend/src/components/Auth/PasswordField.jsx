// frontend/src/components/Auth/PasswordField.jsx
import React from "react";
import { LockKeyhole, Eye, EyeOff, CircleCheck, AlertCircle } from "lucide-react";

export default function PasswordField({
  value,
  onChange,
  showPassword,
  setShowPassword,
  isSignUp = false,
  error,
  name = "password",
  label = "Password",
  placeholder = "Enter your password",
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-semibold text-[#314139] dark:text-[#cbd5e1]">
        {label}
      </label>

      <div className="relative">
        {/* Lock icon */}
        <LockKeyhole
          size={17}
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-[#d94040]" : "text-[#829087] dark:text-[#64748b]"
          }`}
        />

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border bg-white dark:bg-[#16221c] pl-10 text-sm text-[#17251d] dark:text-[#f1f5f9] outline-none transition placeholder:text-[#9aa59e] dark:placeholder:text-[#64748b] focus:ring-2 ${
            error
              ? "border-[#d94040] pr-20 focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] dark:border-[#2b3d33] pr-11 focus:border-[#3d7956] dark:focus:border-[#52b788] focus:ring-[#3d7956]/10"
          }`}
          required
        />

        {/* AlertCircle icon on error */}
        {error && (
          <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-[#d94040]">
            <AlertCircle size={16} />
          </div>
        )}

        {/* Eye toggle button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c8981] dark:text-[#94a3b8] transition hover:text-[#245d3d] dark:hover:text-[#52b788]"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {/* Error message or hint */}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#d94040]">
          {error}
        </p>
      ) : (
        isSignUp && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#718075] dark:text-[#94a3b8]">
            <CircleCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
            Must contain at least 8 characters.
          </p>
        )
      )}
    </div>
  );
}
