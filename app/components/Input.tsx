import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Icon } from '@modules/icons';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  id?: string;
  name?: string;
  onClear?: () => void;
  prefix?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suffix?: React.ReactNode;
  accept?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", placeholder, value = "", onChange, className = "", label, id, name, onClear, prefix, onKeyDown, suffix, accept }, ref) => {
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

    if (type === "file") {
      return (
        <div className="flex flex-col gap-4 w-full">
          {label && <label className="text-white">{label}</label>}
          <input
            ref={internalRef}
            id={inputId}
            name={name || inputId}
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
          />
          <label htmlFor={inputId} className={`w-full flex flex-col p-8 gap-6 items-center text-center border hover:bg-white/5 cursor-pointer ${className}`}>
            <Icon set="pixelart" name="upload" size="sm" />
            <span className="text-white">{placeholder || 'Upload file'}</span>
          </label>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        {label && <label htmlFor={inputId} className="text-white">{label}</label>}
        <div className="relative w-full">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={internalRef}
            id={inputId}
            name={name || inputId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className={`w-full h-14 bg-transparent text-white placeholder:text-grey outline-none border ${prefix ? 'pl-[calc(1rem+var(--prefix-width))]' : 'px-4'} ${value && !suffix ? 'pr-12' : suffix ? 'pr-12' : 'pr-4'} ${className}`}
            style={prefix ? { '--prefix-width': `${prefix.length * 10}px` } as React.CSSProperties : undefined}
          />
          {value && !suffix && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center absolute h-full aspect-square right-0 top-0 opacity-60 hover:opacity-100"
            >
              <Icon set="lucide" name="delete" color="white" stroke="1" className="w-5.5" />
            </button>
          )}
          {suffix && (
            <div className="flex items-center justify-center absolute h-full aspect-square right-0 top-0 pointer-events-none opacity-60">
              {suffix}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;