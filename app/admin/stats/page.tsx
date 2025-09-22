'use client';

import { useState, useEffect } from 'react';
import { BarChart3, BanknoteIcon, Users, TrendingUp } from 'lucide-react';

interface DealerStats {
  dealerId: string;
  dealerName: string;
  totalSales: number;
  totalEarnings: number;
  commission: number;
}

interface Stats {
  totalSales: number;
  totalProfit: number;
  totalDealers: number;
  dealerStats: DealerStats[];
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('all');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/admin/stats?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeframe]);

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
        {/* Header and Time Range Selector */}
        <div className="sm:flex sm:items-center bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500 mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Statistics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track overall sales performance and dealer earnings
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'year' | 'all')}
              className="block rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-900 border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Sales Card */}
            <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-green-50">
                    <BanknoteIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Total Sales</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${stats.totalSales.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-blue-50">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Net Profit</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${stats.totalProfit.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Active Dealers Card */}
            <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-amber-50">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Active Dealers</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalDealers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Average Commission Card */}
            <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md p-3 bg-purple-50">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Avg Commission</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {(stats.dealerStats.reduce((acc, dealer) => acc + dealer.commission, 0) / stats.dealerStats.length * 100).toFixed(1)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dealer Stats Table */}
        {stats && (
          <div className="bg-white shadow-sm ring-1 ring-gray-200 ring-opacity-20 rounded-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Dealer</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Total Sales</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Commission Rate</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Earnings</th>
                  <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-white">Our Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {stats.dealerStats.map((dealer) => (
                  <tr key={dealer.dealerId} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap py-5 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {dealer.dealerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{dealer.dealerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        ${dealer.totalSales.toFixed(2)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        {(dealer.commission * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        ${dealer.totalEarnings.toFixed(2)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        ${(dealer.totalSales - dealer.totalEarnings).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}