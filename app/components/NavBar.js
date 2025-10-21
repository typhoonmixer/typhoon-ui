'use client'; // Mark as client component

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="p-4 bg-transparent text-white flex items-center " style={{ zIndex: 500, backgroundColor: 'transparent', position: 'relative', pointerEvents: 'auto' }}>
            <Link href="/" className="mr-4 flex items-center">
                <img src="/Typhoon_logo.png" alt="Typhoon Logo" className="h-10 w-auto mr-2" />
                <span className="text-white text-2xl font-bold">Typhoon</span>
            </Link>
            <Link href="/compliance" className="ml-4"><span className={` text-base font-semibold ${pathname === '/compliance' ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}>Compliance</span></Link>
            <Link href="/anonymousaccount" className="ml-8"><span className={` text-base font-semibold ${pathname === '/anonymousaccount' ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}>Anonymous Account</span></Link>
            <a target="_blank" rel="noopener noreferrer" href='https://typhoon-2.gitbook.io/typhoon-docs' className="ml-8"><span className='text-base font-semibold text-white hover:text-blue-500'>Docs</span></a>
        </nav>
    );
}