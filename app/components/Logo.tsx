export default function Logo({ className, size }: { className?: string, size?: string }) {
    return (
        <a href="/" className={`flex items-center justify-center px-6 py-4 ${className}`}>
            {/* <img src="/logo.svg" alt="Modules" className={`w-5 pointer-events-none ${size ? `w-${size}` : 'w-5'}`} /> */}
            <div className="w-4 h-4 bg-white"></div>
        </a>
    );
}