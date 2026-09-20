// components/Auth/SelectField.jsx

export default function SelectField({
  label,
  name,
  icon,
  value,
  onChange,
  options = [],
  // Each option can be a plain string OR { label, value }
  loading = false,
  disabled = false,
  error,
}) {
  const isDisabled = disabled || loading;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#314139]">
        {label}
      </label>

      <div className="relative">
        {/* Left icon */}
        <div
          className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-colors ${
            error ? "text-[#d94040]" : "text-[#829087]"
          }`}
        >
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          className={`h-11 w-full appearance-none rounded-lg border bg-white pl-10 pr-8 text-sm text-[#435148] outline-none transition focus:ring-2 ${
            isDisabled ? "cursor-not-allowed opacity-60" : ""
          } ${
            error
              ? "border-[#d94040] focus:border-[#d94040] focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] focus:border-[#3d7956] focus:ring-[#3d7956]/10"
          }`}
        >
          <option value="">
            {loading ? `Loading ${label.toLowerCase()}…` : `Select ${label.toLowerCase()}`}
          </option>

          {options.map((option) => {
            const val = typeof option === "string" ? option : option.value;
            const lab = typeof option === "string" ? option : option.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
        </select>

        {/* Chevron / spinner on the right */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#829087]">
          {loading ? (
            // Animated spinner ring
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
