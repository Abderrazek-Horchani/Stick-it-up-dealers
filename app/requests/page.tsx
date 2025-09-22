'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { StatusBadge } from '@/app/components/StatusBadge';
import { classNames } from '../utils/classNames';
import { BellRing, Clock, Package, Printer, CheckCircle } from 'lucide-react';

interface RestockItem {
  name: string;
  category: string;
  quantity: number;
  imagePath?: string;
}

type RequestStatus = 'PENDING' | 'PRINTING' | 'PRINTED' | 'DELIVERED';

interface RestockRequest {
  id: number;
  dealerName: string;
  displayName: string;
  timestamp: string;
  status: RequestStatus;
  stickers: RestockItem[];
}

const statusColors = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  PRINTING: { icon: Printer, color: 'text-blue-600', bg: 'bg-blue-50' },
  PRINTED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  DELIVERED: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/dealer/requests');
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data.requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and Stats */}
        <div className="grid gap-6 mb-8">
          <div className="sm:flex sm:items-center bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#f1872b]">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Restock Requests</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and monitor your restock requests status.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f1872b]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Back to Store
              </Link>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statusColors).map(([status, { icon: Icon, color, bg }]) => (
              <div key={status} className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={classNames("rounded-md p-3", bg)}>
                        <Icon className={classNames("h-6 w-6", color)} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-600 truncate">{status}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {requests.filter(r => r.status === status).length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 ring-opacity-20 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Request Details</th>
                      <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Date</th>
                      <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Stickers</th>
                      <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Total Quantity</th>
                      <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {requests.map((request) => (
                      <tr key={request.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-[#f1872b] flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  {request.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">Request #{request.id.toString().padStart(4, '0')}</div>
                              <div className="text-gray-500 text-xs">By {request.displayName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(request.timestamp).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.timestamp).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-5">
                          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {request.stickers.map((sticker, index) => (
                              <div key={`${request.id}-${index}`} className="flex items-center space-x-3 mb-2 p-2 rounded-lg hover:bg-gray-50">
                                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                  {(() => {
                                    const category = sticker.category || '';
                                    const name = sticker.name || '';
                                    const categoryParts = category.split('/').filter(Boolean);
                                    const mainCategory = categoryParts[0];
                                    const fileName = name.toLowerCase().replace(/ /g, '_') + '.png';
                                    const imagePath = categoryParts.length > 0
                                      ? `/stickers/${categoryParts.join('/')}/${fileName}`
                                      : `/stickers/${fileName}`;

                                    return (
                                      <div className="relative w-full h-full">
                                        <Image
                                          src={imagePath}
                                          alt={sticker.name || 'Sticker'}
                                          fill
                                          className="object-contain rounded-md p-1"
                                          unoptimized
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {sticker.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {sticker.category}
                                  </p>
                                </div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  {sticker.quantity}x
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5">
                          <div className="flex items-center">
                            <div className="bg-amber-100 text-amber-800 font-medium px-3 py-1 rounded-full text-sm">
                              {request.stickers.reduce(
                                (total, sticker) => total + sticker.quantity,
                                0
                              )} stickers
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5">
                          <div className="flex items-center space-x-3">
                            <StatusBadge status={request.status} />
                          </div>
                        </td>
                      </tr>
                    ))}

                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">
                          No restock requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}