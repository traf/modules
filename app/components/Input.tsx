import { forwardRef } from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  id?: string;
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", placeholder, value, onChange, className = "", label, id, name }, ref) => {
    const inputId = id || name || placeholder?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="flex flex-col gap-3">
        {label && <label htmlFor={inputId} className="text-white">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          name={name || inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`font w-full p-4 bg-transparent text-white placeholder:text-grey outline-none border ${className}`}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;