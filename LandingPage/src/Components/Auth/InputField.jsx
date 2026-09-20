// components/Auth/InputField.jsx

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
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#314139]">
        {label}
      </label>

      <div className="relative">
        {/* Left icon — turns red on error */}
        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-[#d94040]" : "text-[#829087]"
          }`}
        >
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border bg-white pl-10 text-sm outline-none transition placeholder:text-[#9aa59e] focus:ring-2 ${
            error
              ? "border-[#d94040] pr-10 focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] pr-3 focus:border-[#3d7956] focus:ring-[#3d7956]/10"
          }`}
        />

        {/* AlertCircle icon — shown only on error */}
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
