import Link from 'next/link';

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost' | 'full';
  disabled?: boolean;
  className?: string;
  innerClassName?: string;
  prefetch?: boolean;
}

export default function Button({ href, children, className = '', target, rel, onClick, variant = 'secondary', disabled = false, innerClassName = '', prefetch }: ButtonProps) {
  const baseClasses = 'flex items-center justify-center cursor-pointer group disabled:cursor-not-allowed p-2 whitespace-nowrap';

  const variantClasses = {
    primary: '',
    secondary: 'text-grey hover:text-white',
    ghost: '',
    icon: 'aspect-square text-grey hover:text-white',
    full: 'w-full border',
  }[variant];

  const innerClasses = {
    primary: 'bg-white text-black px-1',
    secondary: 'group-hover:bg-white group-hover:text-black px-1',
    ghost: 'group-hover:text-white px-1',
    icon: 'group-hover:bg-white group-hover:text-black p-1',
    full: 'bg-white/90 hover:bg-white text-black p-3 w-full',
  }[variant];

  const content = innerClasses ? <span className={`${innerClasses} ${innerClassName}`}>{children}</span> : children;

  if (href) {
    // External link (has target="_blank" or starts with http)
    if (target === '_blank' || href.startsWith('http')) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={`${baseClasses} ${variantClasses} ${className}`}
        >
          {content}
        </a>
      );
    }
    
    // Internal Next.js link
    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {content}
      </Link>
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