export type Dealer = {
  id: string;
  name: string;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SalesRecord = {
  id: number;
  dealerId: string;
  amount: number;
  commission: number;
  earnings: number;
  timestamp: Date;
  week: number;
  year: number;
  notes?: string | null;
};

export type WeeklyPerformance = {
  id: string;
  dealerId: string;
  week: number;
  year: number;
  totalSales: number;
  totalEarnings: number;
  rank: number;
  updatedAt: Date;
};

export interface DealerWithStats extends Dealer {
  totalSales?: number;
  totalEarnings?: number;
  rank?: number;
}

export interface LeaderboardEntry {
  dealer: {
    id: string;
    name: string;
  };
  totalSales: number;
  totalEarnings: number;
  rank: number;
}

export interface WeeklyStats {
  thisWeek: {
    totalSales: number;
    totalEarnings: number;
    rank?: number;
  };
  lastWeek: {
    totalSales: number;
    totalEarnings: number;
    rank?: number;
  };
}