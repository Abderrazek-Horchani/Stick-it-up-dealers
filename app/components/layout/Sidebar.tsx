'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import classNames from 'classnames';

interface Category {
  name: string;
  path: string;
  subcategories?: Category[];
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (path: string) => void;
}

export default function Sidebar({ categories, selectedCategory, onSelectCategory }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderCategory = (category: Category, level = 0) => (
    <div key={category.path} className="space-y-0.5">
      <button
        onClick={() => onSelectCategory(category.path)}
        className={classNames(
          'flex w-full items-center py-2 px-4 text-sm font-medium rounded-lg',
          'transition-all duration-200 ease-in-out group relative hover:scale-102',
          selectedCategory === category.path
            ? 'bg-gradient-to-r from-stickup-orange/10 to-stickup-coral/10 text-stickup-coral shadow-sm'
            : 'text-gray-700 hover:text-stickup-orange hover:bg-stickup-orange/5',
          level === 0 ? 'font-semibold' : 'ml-4'
        )}
      >
        <span className="relative">
          {category.name}
          {selectedCategory === category.path && (
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-stickup-coral rounded-full" />
          )}
        </span>
        {category.subcategories && category.subcategories.length > 0 && (
          <svg
            className={classNames(
              'ml-auto h-4 w-4 transition-transform duration-200',
              selectedCategory.startsWith(category.path) ? 'rotate-90' : ''
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
      <div
        className={classNames(
          'space-y-0.5 transition-all duration-200',
          selectedCategory.startsWith(category.path) ? 'block' : 'hidden'
        )}
      >
        {category.subcategories?.map((sub) => renderCategory(sub, level + 1))}
      </div>
    </div>
  );

  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const isAdmin = user?.publicMetadata && (user.publicMetadata as { role?: string }).role === "admin";

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Attempting to navigate to admin...');
    // Force a hard navigation
    window.location.href = '/admin';
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-6 border-b border-stickup-yellow/20 bg-gradient-to-r from-stickup-orange/10 to-stickup-coral/10">
        <h1 className="text-3xl font-bold text-stickup-orange hover:text-stickup-coral transition-colors duration-300">
          Sticker Dealer
        </h1>
        <p className="mt-1 text-sm text-stickup-yellow/80">Browse categories below</p>
      </div>
      <div className="flex-1 px-3 py-4 overflow-y-auto bg-white/60 backdrop-blur-sm">
        <nav className="flex flex-col h-full">
          <div className="space-y-2 flex-1">
            {isAdmin && (
              <>
                <a
                  href="/admin"
                  onClick={handleAdminClick}
                  className={classNames(
                    'flex w-full items-center py-2 px-4 text-sm font-semibold rounded-lg mb-2',
                    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors duration-200',
                    'border border-indigo-200 shadow-sm'
                  )}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </a>
                <a
                  href="/admin/dealers"
                  className={classNames(
                    'flex w-full items-center py-2 px-4 text-sm font-semibold rounded-lg mb-4',
                    'bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors duration-200',
                    'border border-amber-200 shadow-sm'
                  )}
                >
                  <svg 
                    className="h-5 w-5 mr-2"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Manage Dealers
                </a>
              </>
            )}
            
            <button
              onClick={() => onSelectCategory('')}
              className={classNames(
                'flex w-full items-center py-2 px-4 text-sm font-semibold rounded-lg',
                'transition-all duration-200 ease-in-out group relative hover:scale-102',
                selectedCategory === ''
                  ? 'bg-stickup-coral/10 text-stickup-coral shadow-sm'
                  : 'text-gray-700 hover:text-stickup-orange hover:bg-stickup-orange/5'
              )}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              All Stickers
            </button>
            <div className="pt-2">
              {categories.map((category) => renderCategory(category))}
            </div>
          </div>
          
          {/* Logout button at the bottom */}
          <div className="pt-4 mt-auto border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={classNames(
                'flex w-full items-center py-2 px-4 text-sm font-medium rounded-lg',
                'bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-200',
                'border border-red-200'
              )}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed z-50 top-4 left-4 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stickup-coral"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile Sidebar */}
      <Transition.Root show={mobileMenuOpen} as="div">
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />

          <div className="fixed inset-0 z-40 flex">
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              {sidebarContent}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}