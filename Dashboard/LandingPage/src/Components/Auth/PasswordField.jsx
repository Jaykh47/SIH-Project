// components/Auth/PasswordField.jsx

import { LockKeyhole, Eye, EyeOff, CircleCheck, AlertCircle } from "lucide-react";

export default function PasswordField({
  value,
  onChange,
  showPassword,
  setShowPassword,
  isSignUp,
  error,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#314139]">
        Password
      </label>

      <div className="relative">
        {/* Lock icon — turns red on error */}
        <LockKeyhole
          size={17}
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-[#d94040]" : "text-[#829087]"
          }`}
        />

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          placeholder="Enter your password"
          className={`h-11 w-full rounded-lg border bg-white pl-10 text-sm outline-none transition placeholder:text-[#9aa59e] focus:ring-2 ${
            error
              ? "border-[#d94040] pr-20 focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] pr-11 focus:border-[#3d7956] focus:ring-[#3d7956]/10"
          }`}
          required
        />

        {/* AlertCircle icon — shown only on error, left of the eye toggle */}
        {error && (
          <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-[#d94040]">
            <AlertCircle size={16} />
          </div>
        )}

        {/* Eye toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c8981] transition hover:text-[#245d3d]"
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {/* Error message */}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#d94040]">
          {error}
        </p>
      ) : (
        isSignUp && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#718075]">
            <CircleCheck size={12} />
            Must contain at least 8 characters.
          </p>
        )
      )}
    </div>
  );
}
