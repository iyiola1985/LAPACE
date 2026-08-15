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
  activeClassName = "border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white",
  idleClassName = "border border-border-subtle bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:border-primary hover:text-primary",
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
