import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/lightswind/dropdown-menu";

export default function CustomSelect({
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

  // Find currently selected option
  const selectedOption = options.find((option) => {
    const val =
      typeof option === "string" ? option : option.value;

    return val === value;
  });

  const selectedLabel = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : "";

  const handleSelect = (selectedValue) => {
    // Create the same event structure
    // that your existing handleChange expects
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    });
  };

  return (
    <div>
      {/* Label */}
      <label className="mb-1.5 block text-xs font-semibold text-[#314139]">
        {label}
      </label>

      <DropdownMenu>
        {/* Trigger */}
        <DropdownMenuTrigger
          disabled={isDisabled}
          className={`relative flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm outline-none transition ${
            isDisabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          } ${
            error
              ? "border-[#d94040] focus:ring-2 focus:ring-[#d94040]/10"
              : "border-[#d5ddd7] focus:ring-2 focus:ring-[#3d7956]/10"
          }`}
        >
          {/* Left icon */}
          <div
            className={`flex items-center gap-2 ${
              error ? "text-[#d94040]" : "text-[#829087]"
            }`}
          >
            {icon}

            <span
              className={
                selectedLabel
                  ? "text-[#435148]"
                  : "text-[#829087]"
              }
            >
              {loading
                ? `Loading ${label.toLowerCase()}…`
                : selectedLabel ||
                  `Select ${label.toLowerCase()}`}
            </span>
          </div>

          {/* Right side */}
          {loading ? (
            <svg
              className="h-3.5 w-3.5 animate-spin text-[#829087]"
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
              className="text-[#829087]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </DropdownMenuTrigger>

        {/* Dropdown */}
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {options.map((option) => {
            const val =
              typeof option === "string"
                ? option
                : option.value;

            const lab =
              typeof option === "string"
                ? option
                : option.label;

            return (
              <DropdownMenuItem
                key={val}
                onClick={() => handleSelect(val)}
                className="cursor-pointer"
              >
                {lab}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Error */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#d94040]">
          {error}
        </p>
      )}
    </div>
  );
}

