'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { classNames } from '../utils/classNames';
import { StatusBadge } from '../components/StatusBadge';
import {
  BellRing,
  Printer,
  Package,
  CheckCircle,
  Clock,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface StickerRequest {
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
  stickers: StickerRequest[];
}

// Map for status-based icon and color
const statusColors = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  PRINTING: { icon: Printer, color: 'text-blue-600', bg: 'bg-blue-50' },
  PRINTED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  DELIVERED: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  const handleUpdateStatus = useCallback(async (requestId: number, newStatus: RequestStatus) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const validStatuses: RequestStatus[] = ['PENDING', 'PRINTING', 'PRINTED', 'DELIVERED'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status value: ${newStatus}`);
      }

      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setRequests(prev =>
        prev.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (err) {
      const error = err as Error;
      console.error('Error updating status:', error.message);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  }, []);

  const handleDeleteRequest = useCallback(async (requestId: number) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete request');

      setRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/requests');
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Dashboard Header and Stats */}
      <div className="grid gap-6 mb-8">
        <div className="sm:flex sm:items-center bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Restock Requests Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor and manage all restock requests submitted by dealers. View detailed information and update order statuses.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-amber-500 focus:outline-none ring-2 ring-offset-2 ring-amber-300 shadow-sm">
              <BellRing size={16} className="mr-2 animate-pulse" /> {requests.length} Active Requests
            </span>
          </div>
        </div>
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
                    <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Dealer</th>
                    <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Date</th>
                    <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Stickers</th>
                    <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Total Quantity</th>
                    <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {requests.map((request) => (
                    <tr key={request.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {request.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{request.displayName}</div>
                            <div className="text-gray-500 text-xs">Request #{request.id.toString().padStart(4, '0')}</div>
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
                      <td className="px-3 py-5 text-sm text-gray-600">
                        <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                          {request.stickers.map((sticker, index) => (
                            <div key={`${request.id}-${index}`} className="flex items-center space-x-3 mb-2 p-2 rounded-lg hover:bg-gray-50" title={`Category: ${sticker.category}\nName: ${sticker.name}`}>
                              <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                {(() => {
                                  const category = sticker.category || '';
                                  const name = sticker.name || '';
                                  const categoryParts = category.split('/').filter(Boolean);
                                  const mainCategory = categoryParts[0];
                                  const subCategory = categoryParts[1];
                                  let fileName;
                                  if (mainCategory === "Anime" && subCategory) {
                                    fileName = name.toLowerCase().replace(/ /g, '_') + '.png';
                                  } else if (mainCategory === "Arcane") {
                                    fileName = name.toLowerCase().replace(/ /g, '_') + '.png';
                                  } else if (mainCategory === "Formula 1") {
                                    fileName = name.toLowerCase().replace(/ /g, '_') + '.png';
                                  } else {
                                    fileName = name.toLowerCase().replace(/ /g, '_') + '.png';
                                  }
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
                                  {sticker.category.split('/').pop() || sticker.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {sticker.category.split('/')[0]}
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
                          <div className="relative">
                            <select
                              value={request.status}
                              onChange={(e) => handleUpdateStatus(request.id, e.target.value as RequestStatus)}
                              className={classNames(
                                'block w-full rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-900',
                                'border border-gray-200 bg-white shadow-sm cursor-pointer',
                                'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
                                actionLoading[request.id] ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-500'
                              )}
                              disabled={actionLoading[request.id]}
                            >
                              <option value="PENDING" className="text-amber-600 font-semibold"> Pending</option>
                              <option value="PRINTING" className="text-blue-600 font-semibold"> Printing</option>
                              <option value="PRINTED" className="text-green-600 font-semibold"> Printed</option>
                              <option value="DELIVERED" className="text-indigo-600 font-semibold"> Delivered</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <ChevronDown size={20} className="text-gray-500" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={actionLoading[request.id]}
                          className={classNames(
                            'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium',
                            'text-white bg-red-600',
                            'hover:bg-red-700',
                            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                            'shadow-sm transition-all duration-200 ease-in-out',
                            'transform hover:scale-105',
0                          )}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}