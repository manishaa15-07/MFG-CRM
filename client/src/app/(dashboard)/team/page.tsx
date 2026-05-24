'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { analyticsService } from '@/services/analyticsService';
import { TeamMember } from '@/types';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await analyticsService.getTeamPerformance();
        if (response.success) {
          setTeamMembers(response.data);
        }
      } catch (error) {
        toast.error('Failed to load team performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const chartData = teamMembers.map((member) => ({
    name: member.user.name,
    Won: member.wonDeals,
    Lost: member.lostDeals,
    Revenue: member.revenue
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Team Performance</h2>
        <p className="text-muted-foreground">Monitor your sales team&apos;s KPIs and leaderboards.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Leaderboard Table */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top performers by revenue and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-center">Leads</TableHead>
                    <TableHead className="text-center">Win Rate</TableHead>
                    <TableHead className="text-right">Revenue generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((member) => (
                    <TableRow key={member.user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(member.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{member.user.name}</div>
                            <div className="text-xs text-muted-foreground">{member.user.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal">{member.totalLeads}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${member.conversionRate > 20 ? 'text-green-500' : ''}`}>
                          {member.conversionRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(member.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Deals Won/Lost Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Deals Overview</CardTitle>
            <CardDescription>Won vs Lost comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground h-[300px] flex items-center justify-center">
                Not enough data
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    />
                    <Legend />
                    <Bar dataKey="Won" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="Lost" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
