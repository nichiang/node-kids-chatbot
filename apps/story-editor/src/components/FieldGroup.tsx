import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  helpText?: string;
}

export function FieldGroup({ label, children, helpText }: FieldGroupProps) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {helpText && <p className="help-text">{helpText}</p>}
    </div>
  );
}
