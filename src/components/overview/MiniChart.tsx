import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { PricePoint } from "@/types";

interface MiniChartProps {
  data: PricePoint[];
  isPositive: boolean;
}

export function MiniChart({ data, isPositive }: MiniChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      value: point.value,
    }));
  }, [data]);

  const color = isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const fillColor = isPositive ? "hsl(var(--success) / 0.2)" : "hsl(var(--destructive) / 0.2)";

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
