"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition ${error ? "border-red" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
