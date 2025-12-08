import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Icon } from '@modules/icons';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  id?: string;
  name?: string;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", placeholder, value, onChange, className = "", label, id, name, onClear }, ref) => {
    const inputId = id || name || placeholder?.toLowerCase().replace(/\s+/g, '-');
    const internalRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
      internalRef.current?.focus();
    };

    return (
      <div className="flex flex-col gap-3">
        {label && <label htmlFor={inputId} className="text-white">{label}</label>}
        <div className="relative w-full">
          <input
            ref={internalRef}
            id={inputId}
            name={name || inputId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full h-14 px-4 bg-transparent text-white placeholder:text-grey outline-none border ${value ? 'pr-12' : ''} ${className}`}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center absolute h-full aspect-square right-0 top-0 opacity-60 hover:opacity-100"
            >
              <Icon set="lucide" name="delete" color="white" stroke="1" className="w-5.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;