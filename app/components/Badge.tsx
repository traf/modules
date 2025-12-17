interface BadgeProps {
  children: React.ReactNode;
  variant?: 'grey' | 'white' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  className?: string;
}

export default function Badge({ children, variant = 'grey', className = '' }: BadgeProps) {
  const variantClasses = {
    grey: 'bg-neutral-800 text-white',
    white: 'bg-white text-black',
    green: 'bg-green-950 text-green-400',
    yellow: 'bg-yellow-950 text-yellow-400',
    red: 'bg-red-950 text-red-400',
    blue: 'bg-blue-950 text-blue-400',
    purple: 'bg-violet-950 text-violet-400',
  }[variant];

  return (
    <span className={`flex items-center justify-center text-xs py-1 px-2 ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
