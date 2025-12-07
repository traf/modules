interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  disabled?: boolean;
}

export default function Button({ href, children, className = '', target, onClick, variant = 'secondary', disabled = false }: ButtonProps) {
  const baseClasses = 'flex items-center justify-center cursor-pointer group disabled:cursor-not-allowed p-2';

  const variantClasses = {
    primary: '',
    secondary: 'text-grey hover:text-white',
    ghost: '',
    icon: 'aspect-square text-grey hover:text-white',
  }[variant];

  const innerClasses = {
    primary: 'bg-white text-black px-1',
    secondary: 'group-hover:bg-white group-hover:text-black px-1',
    ghost: 'group-hover:text-white px-1',
    icon: 'group-hover:bg-white group-hover:text-black p-1',
  }[variant];

  const content = <span className={`${innerClasses}`}>{children}</span>;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}