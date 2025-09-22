'use client';

import { useState, useEffect } from 'react';
import { Users, Percent } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface Dealer {
  id: string;
  name: string;
  email: string;
  commission: number;
  createdAt: string;
}

export default function DealerManagementPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDealer, setEditingDealer] = useState<string | null>(null);
  const [newCommission, setNewCommission] = useState<string>('');

  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetchDealers();
    }
  }, [isLoaded, user]);

  const fetchDealers = async () => {
    try {
      const response = await fetch('/api/admin/dealers');
      if (!response.ok) {
        throw new Error('Failed to fetch dealers');
      }
      const data = await response.json();
      setDealers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCommission = (dealerId: string, currentCommission: number) => {
    setEditingDealer(dealerId);
    setNewCommission((currentCommission * 100).toString());
  };

  const handleCancelEdit = () => {
    setEditingDealer(null);
    setNewCommission('');
  };

  const handleSaveCommission = async (dealerId: string) => {
    try {
      const commission = parseFloat(newCommission) / 100;
      if (isNaN(commission) || commission < 0 || commission > 1) {
        throw new Error('Invalid commission rate');
      }

      const response = await fetch('/api/admin/dealers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerId,
          commission,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update commission');
      }

      // Refresh dealers list
      await fetchDealers();
      setEditingDealer(null);
      setNewCommission('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update commission');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-red-600">Authentication required</div>
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
        {/* Header */}
        <div className="sm:flex sm:items-center bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500 mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dealer Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage dealer commission rates and view dealer details
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-600 bg-amber-50">
              <Users className="h-5 w-5 mr-2" />
              {dealers.length} Dealers
            </div>
          </div>
        </div>

        {/* Dealers Table */}
        <div className="bg-white shadow-sm ring-1 ring-gray-200 ring-opacity-20 rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Dealer</th>
                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Email</th>
                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Commission Rate</th>
                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Joined</th>
                <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {dealers.map((dealer) => (
                <tr key={dealer.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {dealer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{dealer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    {dealer.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5">
                    {editingDealer === dealer.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative rounded-md shadow-sm w-24">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newCommission}
                            onChange={(e) => setNewCommission(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-2 pr-8 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <Percent className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSaveCommission(dealer.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {(dealer.commission * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                    {new Date(dealer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {editingDealer !== dealer.id && (
                      <button
                        onClick={() => handleEditCommission(dealer.id, dealer.commission)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        Edit Commission
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}