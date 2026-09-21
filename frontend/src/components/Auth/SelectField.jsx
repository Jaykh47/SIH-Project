// frontend/src/components/Auth/SelectField.jsx
import React from "react";

export default function SelectField({
  label,
  name,
  icon,
  value,
  onChange,
  options = [],
  loading = false,
  disabled = false,
  error,
}) {
  const isDisabled = disabled || loading;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-[#314139] dark:text-[#cbd5e1]">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div
            className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-colors ${
              error ? "text-[#d94040]" : "text-[#829087] dark:text-[#64748b]"
            }`}
          >
            {icon}
          </div>
        )}

        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={isDisabled}
          className={`h-11 w-full appearance-none rounded-lg border bg-white dark:bg-[#16221c] text-sm text-[#314139] dark:text-[#f1f5f9] outline-none transition focus:ring-2 ${
            icon ? "pl-10" : "pl-3.5"
          } pr-8 ${
            isDisabled ? "cursor-not-allowed opacity-60 bg-slate-50 dark:bg-[#111a15]" : ""
          } ${
            error
              ? "border-[#d94040] focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] dark:border-[#2b3d33] focus:border-[#3d7956] dark:focus:border-[#52b788] focus:ring-[#3d7956]/10"
          }`}
        >
          <option value="" className="dark:bg-[#16221c] dark:text-slate-300">
            {loading ? `Loading ${label.toLowerCase()}…` : `Select ${label.toLowerCase()}`}
          </option>

          {options.map((option) => {
            const val = typeof option === "string" ? option : option.value;
            const lab = typeof option === "string" ? option : option.label;
            return (
              <option key={val} value={val} className="dark:bg-[#16221c] dark:text-[#f1f5f9]">
                {lab}
              </option>
            );
          })}
        </select>

        {/* Right chevron or spinner */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#829087]">
          {loading ? (
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </div>
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
