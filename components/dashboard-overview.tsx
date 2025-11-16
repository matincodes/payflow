'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';

interface Transaction {
  status: string;
  amount: number;
}

interface DashboardOverviewProps {
  transactions: Transaction[];
}

export function DashboardOverview({ transactions }: DashboardOverviewProps) {
  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter(t => t.status === 'success').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const totalAmount = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      icon: Target,
      label: 'Total Transactions',
      value: totalTransactions,
      change: '+0%',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: CheckCircle,
      label: 'Successful',
      value: successfulTransactions,
      change: '+0%',
      bgColor: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: pendingTransactions,
      change: `${pendingTransactions > 0 ? '+' : ''}${pendingTransactions}`,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: TrendingUp,
      label: 'Total Amount',
      value: `₦${totalAmount.toFixed(2)}`,
      change: '+0%',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 dark:text-green-400">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
