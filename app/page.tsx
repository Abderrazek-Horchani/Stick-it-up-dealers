'use client';

import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Sidebar from './components/layout/Sidebar';
import StickerGrid from './components/StickerGrid';
import Cart from './components/Cart';
import DealerNameModal from './components/DealerNameModal';
import { Category, Sticker, filterStickersByCategory } from './utils/stickers';
import Image from 'next/image';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showDealerModal, setShowDealerModal] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStickersData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stickers');
        const data = await response.json();
        setCategories(data.categories);
        setStickers(data.stickers);
      } catch (error) {
        console.error('Error fetching stickers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStickersData();
  }, []);

  // Separate useEffect for client-side localStorage check
  useEffect(() => {
    const storedDealerName = localStorage.getItem('dealerName');
    if (storedDealerName) {
      setDealerName(storedDealerName);
      setShowDealerModal(false);
    }
  }, []);

  const handleQuantityChange = (sticker: Sticker, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [`${sticker.category}/${sticker.name}`]: quantity,
    }));
  };

  const handleDealerNameSubmit = (name: string) => {
    setDealerName(name);
    localStorage.setItem('dealerName', name);
    setShowDealerModal(false);
  };

  const handleRestockSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedStickers = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([key, quantity]) => {
          const [category, name] = key.split('/');
          return { category, name, quantity };
        });

      if (selectedStickers.length === 0) {
        throw new Error('No stickers selected');
      }

      const response = await fetch('/api/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerName: user?.fullName || user?.firstName || dealerName,
          stickers: selectedStickers,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit restock request');
      }

      setQuantities({});
      setIsCartOpen(false);
      alert('Restock request submitted successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error submitting restock request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItems = stickers
    .filter((sticker) => quantities[`${sticker.category}/${sticker.name}`] > 0)
    .map((sticker) => ({
      ...sticker,
      quantity: quantities[`${sticker.category}/${sticker.name}`],
    }));

  const displayedStickers = filterStickersByCategory(stickers, selectedCategory);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stickup-coral to-stickup-yellow p-4">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image src="/next.svg" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-stickup-coral">Welcome to Stick it Up!</h1>
          <p className="text-gray-600 mb-8">
            Sign in to access your dealer dashboard and manage your sticker inventory.
          </p>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="w-full py-3 px-6 bg-stickup-coral text-white rounded-full font-medium hover:bg-opacity-90 transition-all duration-200">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full py-3 px-6 bg-white text-stickup-coral border-2 border-stickup-coral rounded-full font-medium hover:bg-stickup-coral/5 transition-all duration-200">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DealerNameModal isOpen={showDealerModal} onSubmit={handleDealerNameSubmit} />

      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="md:pl-64 min-h-screen pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-stickup-coral/10">
              <div>
                <h1 className="text-3xl font-bold text-stickup-coral mb-2">
                  Welcome, {user?.firstName || 'Dealer'}!
                </h1>
                <p className="text-sm text-gray-600">
                  {displayedStickers.length} stickers available in {selectedCategory || 'all categories'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/requests"
                  className="inline-flex items-center px-6 py-3 shadow-lg shadow-gray-200/20
                    text-gray-700 text-sm font-medium rounded-full transition-all duration-300
                    bg-white border border-gray-200
                    hover:scale-105 hover:shadow-xl hover:border-stickup-coral
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stickup-coral"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h5.25a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664M12 12.75h8.25M12 15.75h8.25M12 18.75h8.25" />
                  </svg>
                  My Requests
                </a>
                <a
                  href="/performance"
                  className="inline-flex items-center px-6 py-3 shadow-lg shadow-gray-200/20
                    text-gray-700 text-sm font-medium rounded-full transition-all duration-300
                    bg-white border border-gray-200
                    hover:scale-105 hover:shadow-xl hover:border-stickup-coral
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stickup-coral"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                  </svg>
                  Leaderboard
                </a>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={classNames(
                    "inline-flex items-center px-6 py-3 shadow-lg shadow-stickup-coral/20",
                    "text-white text-sm font-medium rounded-full transition-all duration-300",
                    "bg-stickup-coral",
                    "hover:scale-105 hover:shadow-xl hover:shadow-stickup-coral/30",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stickup-coral",
                    cartItems.length > 0 ? "animate-bounce-slight" : ""
                  )}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  View Cart ({cartItems.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="rounded-xl border-2 border-stickup-yellow/20 overflow-hidden bg-white/50">
                        <div className="aspect-square bg-gradient-to-br from-stickup-orange/10 to-stickup-coral/10"></div>
                        <div className="p-6 space-y-4">
                          <div className="h-4 bg-stickup-yellow/20 rounded-full w-3/4"></div>
                          <div className="h-4 bg-stickup-orange/10 rounded-full w-1/2"></div>
                          <div className="flex justify-center space-x-3 pt-2">
                            <div className="h-10 w-10 bg-stickup-coral/10 rounded-full"></div>
                            <div className="h-10 w-10 bg-stickup-yellow/20 rounded-full"></div>
                            <div className="h-10 w-10 bg-stickup-orange/10 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <StickerGrid
                    stickers={displayedStickers}
                    selectedQuantities={quantities}
                    onQuantityChange={handleQuantityChange}
                  />
                  {displayedStickers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-600">No stickers found in this category</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Cart
        open={isCartOpen}
        setOpen={setIsCartOpen}
        items={cartItems}
        onQuantityChange={handleQuantityChange}
        onSubmit={handleRestockSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
