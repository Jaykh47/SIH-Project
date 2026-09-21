// frontend/src/components/Auth/InputField.jsx
import React from "react";
import { AlertCircle } from "lucide-react";

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error,
  required = false,
  autoFocus = false,
  maxLength,
  disabled = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-[#314139] dark:text-[#cbd5e1]">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left icon — turns red on error */}
        {icon && (
          <div
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              error ? "text-[#d94040]" : "text-[#829087] dark:text-[#64748b]"
            }`}
          >
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          maxLength={maxLength}
          disabled={disabled}
          className={`h-11 w-full rounded-lg border bg-white dark:bg-[#16221c] text-sm text-[#17251d] dark:text-[#f1f5f9] outline-none transition placeholder:text-[#9aa59e] dark:placeholder:text-[#64748b] focus:ring-2 ${
            icon ? "pl-10" : "pl-3.5"
          } ${
            error
              ? "border-[#d94040] pr-10 focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] dark:border-[#2b3d33] pr-3 focus:border-[#3d7956] dark:focus:border-[#52b788] focus:ring-[#3d7956]/10"
          } disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-[#111a15] disabled:opacity-60`}
        />

        {/* AlertCircle icon — shown on error */}
        {error && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#d94040]">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#d94040]">
          {error}
        </p>
      )}
    </div>
  );
}
