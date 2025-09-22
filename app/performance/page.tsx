'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BarChart3, Trophy, BanknoteIcon } from 'lucide-react';

interface SalesRecord {
  id: number;
  amount: number;
  commission: number;
  earnings: number;
  timestamp: string;
  notes?: string;
}

interface LeaderboardEntry {
  dealerId: string;
  dealerName: string;
  totalSales: number;
  totalEarnings: number;
  rank: number;
}

export default function PerformancePage() {
  const { userId } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [mySales, setMySales] = useState<SalesRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboards and sales data
  useEffect(() => {
    async function fetchData() {
      try {
        const [weeklyRes, allTimeRes, salesRes] = await Promise.all([
          fetch('/api/leaderboard/weekly'),
          fetch('/api/leaderboard/alltime'),
          fetch(`/api/sales/${userId}`),
        ]);

        if (!weeklyRes.ok || !allTimeRes.ok || !salesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const weeklyData = await weeklyRes.json();
        const allTimeData = await allTimeRes.json();
        const salesData = await salesRes.json();

        setWeeklyLeaderboard(weeklyData);
        setAllTimeLeaderboard(allTimeData);
        setMySales(salesData.sales);
      } catch (err) {
        setError('Failed to load leaderboard data');
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record sale');
      }

      // Refresh data
      const salesRes = await fetch(`/api/sales/${userId}`);
      const salesData = await salesRes.json();
      setMySales(salesData.sales);

      // Clear form
      setAmount('');
    } catch (err) {
      setError('Failed to record sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your sales performance and see how you rank among other dealers
          </p>
        </div>

        {/* Add Sale Form */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Record New Sale</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Sale Amount ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {loading ? 'Recording...' : 'Record Sale'}
            </button>
          </form>
        </div>

        {/* Leaderboards Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          {/* Weekly Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold">Weekly Leaderboard</h2>
            </div>
            <div className="space-y-4">
              {weeklyLeaderboard.map((entry) => (
                <div
                  key={entry.dealerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.dealerId === userId ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-gray-700">#{entry.rank}</span>
                    <span className="text-sm font-medium text-gray-900">{entry.dealerName}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${entry.totalSales.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* All-Time Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold">All-Time Leaders</h2>
            </div>
            <div className="space-y-4">
              {allTimeLeaderboard.map((entry) => (
                <div
                  key={entry.dealerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.dealerId === userId ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-gray-700">#{entry.rank}</span>
                    <span className="text-sm font-medium text-gray-900">{entry.dealerName}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${entry.totalSales.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BanknoteIcon className="h-6 w-6 text-amber-500 mr-2" />
            <h2 className="text-xl font-semibold">Recent Sales</h2>
          </div>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mySales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(sale.commission * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.earnings.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {mySales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No sales recorded yet
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
  );
}