'use client';

import { usePathname } from 'next/navigation';
import Logo from './Logo';
import Button from './Button';

export default function Nav() {
    const pathname = usePathname();

    return (
        <div className="w-full h-14 flex items-center justify-between bg-black/10 backdrop-blur-sm border-b sticky top-0 z-20">
            <Logo />
            <div className="flex items-center pr-3 h-full">
                <Button
                    href="/icons"
                    className="h-full"
                    variant={pathname === '/icons' ? 'primary' : undefined}
                >
                    Icons
                </Button>
                <Button
                    href="/domains"
                    className="h-full"
                    variant={pathname === '/domains' ? 'primary' : undefined}
                >
                    Domains
                </Button>
                {/* <Button 
                    href="/media" 
                    className="h-full" 
                    variant={pathname === '/media' ? 'primary' : undefined}
                >
                    Media
                </Button> */}
                <Button href="https://github.com/traf/modules" target="_blank" className="h-full">Github</Button>
                <Button href="https://x.com/traf" target="_blank" className="h-full">@traf</Button>
            </div>
        </div>
    );
}
