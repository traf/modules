import Link from 'next/link';

export default function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={`flex items-center justify-center px-6 py-4 ${className}`}>
            <div className="w-4 h-4 bg-white"></div>
        </Link>
    );
}