'use client';

import { useState } from 'react';
import {
  Person,
  Gear,
  Magnifier,
  Cube,
  Bars,
  Xmark,
  House,
  ArrowRightFromSquare,
} from '@gravity-ui/icons';
import { Avatar } from '@heroui/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  superuserOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Magnifier },
  { href: '/admin/users', label: 'Users', icon: Person, superuserOnly: true },
  { href: '/', label: 'Homepage', icon: House },
  {
    href: '/my-teams',
    label: 'My Teams',
    icon: Gear,
    superuserOnly: true,
  },
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const userData = session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className='fixed top-20 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden'
        aria-label='Toggle Sidebar'
      >
        {isOpen ? (
          <Xmark className='w-6 h-6 text-black' />
        ) : (
          <Bars className='w-6 h-6 text-black' />
        )}
      </button>

      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-16 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out md:sticky md:top-16 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-6 flex items-center space-x-4 border-b border-gray-100 mt-14 md:mt-4'>
          <div className='p-2'>
            <Avatar>
              <Avatar.Image
                alt={userData?.name ?? ''}
                src={userData?.image ?? ''}
                referrerPolicy='no-referrer'
              />
              <Avatar.Fallback>
                <Person className='w-8 h-8 text-black stroke-2' />
              </Avatar.Fallback>
            </Avatar>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-gray-400'>
              {userData?.name ?? 'Loading...'}
            </span>
            <span className='text-base font-medium text-black'>
              {userData?.role ?? 'Loading...'}
            </span>
          </div>
        </div>

        <div className='p-4 flex-1 mt-2'>
          <span className='text-sm text-gray-400 ml-4 mb-4 block'>Main</span>

          <nav className='space-y-2'>
            {NAV_ITEMS.map(({ href, label, icon: Icon, superuserOnly }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-colors ${
                    active
                      ? 'bg-[#e8ebe9] text-black'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Icon className='w-6 h-6 stroke-2' />
                  <span className='font-medium'>{label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => signOut()}
              className='flex items-center space-x-4 px-4 py-4 text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors w-full cursor-pointer'
            >
              <ArrowRightFromSquare className='w-6 h-6 stroke-2' />
              <span className='font-medium'>Sign Out</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}