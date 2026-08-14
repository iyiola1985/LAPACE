"use client";

type FilterChipsProps<T extends string> = {
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  activeClassName?: string;
  idleClassName?: string;
};

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  activeClassName = "rounded-full border border-primary bg-primary-container px-4 py-2 text-xs font-medium text-on-primary-container",
  idleClassName = "rounded-full border border-border-subtle bg-surface-container-lowest px-4 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low",
}: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={active ? activeClassName : idleClassName}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
