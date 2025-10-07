'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

type WeeklyApplicationsChartProps = {
  data: { date: string; applications: number }[];
};

export default function WeeklyApplicationsChart({
  data,
}: WeeklyApplicationsChartProps) {
  const chartConfig = {
    applications: {
      label: 'Applications',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--foreground))"
            className="text-xs"
          />
          <YAxis stroke="hsl(var(--foreground))" allowDecimals={false} className="text-xs" />
          <Tooltip
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: 'hsl(var(--chart-1))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
