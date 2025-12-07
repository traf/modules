import Link from 'next/link';

export default function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={`flex items-center justify-center w-4 h-4 bg-white ${className}`}></Link>
    );
}