'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type ApplicationsBySourceChartProps = {
  data: { source: string; count: number }[];
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ApplicationsBySourceChart({
  data,
}: ApplicationsBySourceChartProps) {
  const chartConfig = {
    count: {
      label: 'Applications',
    },
    ...data.reduce((acc, { source }) => {
        acc[source] = { label: source };
        return acc;
    }, {} as any)
  };


  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            labelLine={false}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              index,
            }) => {
              const RADIAN = Math.PI / 180;
              const radius =
                25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="hsl(var(--foreground))"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  className="text-xs"
                >
                  {data[index].source} ({value})
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
