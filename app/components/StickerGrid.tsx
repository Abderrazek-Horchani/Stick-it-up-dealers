'use client';

import { useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';

interface Sticker {
  name: string;
  category: string;
  imagePath: string;
}

interface StickerGridProps {
  stickers: Sticker[];
  onQuantityChange: (sticker: Sticker, quantity: number) => void;
  selectedQuantities: Record<string, number>;
}

export default function StickerGrid({ stickers, onQuantityChange, selectedQuantities }: StickerGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {stickers.map((sticker) => (
        <div
          key={`${sticker.category}/${sticker.name}`}
          className={classNames(
            'group relative flex flex-col rounded-xl border-2 overflow-hidden bg-gray-50 h-[420px]',
            'transform transition-all duration-300 hover:-translate-y-2',
            'hover:shadow-xl hover:shadow-stickup-coral/10',
            selectedQuantities[`${sticker.category}/${sticker.name}`] > 0
              ? 'border-stickup-coral ring-2 ring-stickup-coral animate-bounce-slight'
              : 'border-gray-200/50 hover:border-stickup-coral'
          )}
        >
          <div className="h-[250px] relative bg-gray-100 p-6">
            <div className="relative h-full w-full">
              <Image
                src={sticker.imagePath}
                alt={sticker.name}
                width={300}
                height={300}
                className="object-contain w-full h-full transform transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">{sticker.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{sticker.category}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => {
                    const currentQuantity = selectedQuantities[`${sticker.category}/${sticker.name}`] || 0;
                    if (currentQuantity > 0) {
                      onQuantityChange(sticker, currentQuantity - 1);
                    }
                  }}
                  className={classNames(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-stickup-coral focus:ring-offset-2',
                    'border-2 border-stickup-coral text-stickup-coral hover:bg-stickup-coral hover:text-white',
                    'hover:scale-105 active:scale-95'
                  )}
                  aria-label="Decrease quantity"
                >
                  <span className="text-lg font-medium ">-</span>
                </button>
                <span className="min-w-[3rem] text-center text-lg font-semibold text-gray-900">
                  {selectedQuantities[`${sticker.category}/${sticker.name}`] || 0}
                </span>
                <button
                  onClick={() => {
                    const currentQuantity = selectedQuantities[`${sticker.category}/${sticker.name}`] || 0;
                    onQuantityChange(sticker, currentQuantity + 1);
                  }}
                  className={classNames(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-stickup-coral focus:ring-offset-2',
                    'bg-stickup-coral text-white hover:bg-stickup-coral/90',
                    'hover:scale-105 active:scale-95'
                  )}
                  aria-label="Increase quantity"
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}