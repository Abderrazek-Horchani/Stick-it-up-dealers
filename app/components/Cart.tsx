'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import classNames from 'classnames';

interface CartSticker {
  name: string;
  category: string;
  imagePath: string;
  quantity: number;
}

interface CartProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: CartSticker[];
  onQuantityChange: (sticker: CartSticker, quantity: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function Cart({ open, setOpen, items, onQuantityChange, onSubmit, isSubmitting = false }: CartProps) {
  const [mounted, setMounted] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Restock Cart ({totalItems} items)
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="divide-y divide-gray-100">
                            {items.map((item) => (
                              <li key={`${item.category}/${item.name}`} className="flex py-6 px-2 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                  <div className="relative h-full w-full p-2">
                                    <Image
                                      src={item.imagePath}
                                      alt={item.name}
                                      width={80}
                                      height={80}
                                      className="h-full w-full object-contain object-center"
                                    />
                                  </div>
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3 className="font-semibold text-lg">{item.name}</h3>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => onQuantityChange(item, item.quantity - 1)}
                                        className={classNames(
                                          'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                                          'focus:outline-none focus:ring-2 focus:ring-stickup-coral focus:ring-offset-2',
                                          'border-2 border-stickup-coral hover:border-stickup-coral hover:text-stickup-coral'
                                        )}
                                      >
                                        <span className="text-lg font-medium">-</span>
                                      </button>
                                      <span className="text-lg font-semibold min-w-[2rem] text-center text-gray-900">{item.quantity}</span>
                                      <button
                                        onClick={() => onQuantityChange(item, item.quantity + 1)}
                                        className={classNames(
                                          'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                                          'focus:outline-none focus:ring-2 focus:ring-stickup-coral focus:ring-offset-2',
                                          'bg-stickup-coral text-white hover:bg-stickup-coral/90'
                                        )}
                                      >
                                        <span className="text-lg font-medium">+</span>
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => onQuantityChange(item, 0)}
                                      className="flex items-center font-medium text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      <span className="ml-1">Remove</span>
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                        <p>Total Items</p>
                        <p className="text-xl font-semibold">{totalItems}</p>
                      </div>
                      <div className="space-y-4">
                        <button
                          onClick={onSubmit}
                          disabled={totalItems === 0 || isSubmitting}
                          className={classNames(
                            'w-full flex items-center justify-center rounded-xl border border-transparent px-6 py-4',
                            'text-base font-semibold text-white shadow-sm transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-stickup-coral focus:ring-offset-2',
                            totalItems === 0 || isSubmitting
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-stickup-coral hover:bg-stickup-coral/90 transform hover:-translate-y-0.5'
                          )}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            <>
                              {totalItems === 0 ? 'Cart is Empty' : 'Submit Restock Request'}
                              {totalItems > 0 && (
                                <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 hover:text-gray-900"
                          onClick={() => setOpen(false)}
                        >
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}