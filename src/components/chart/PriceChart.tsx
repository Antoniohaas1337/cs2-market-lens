import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ChartData, TimeRange } from "@/types";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  data: ChartData;
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    return data.data_points.map((point) => ({
      ...point,
      date: parseISO(point.timestamp),
      formattedDate: format(parseISO(point.timestamp), "MMM d"),
      formattedTime: format(parseISO(point.timestamp), "HH:mm"),
    }));
  }, [data.data_points]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percent: 0 };
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent };
  }, [chartData]);

  const minValue = Math.min(...chartData.map((d) => d.value)) * 0.98;
  const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.02;

  return (
    <div className="w-full">
      {/* Chart metadata */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {chartData.length} data points
          </span>
          <span className="text-sm text-muted-foreground">
            Currency: {data.currency}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-lg font-semibold font-mono",
              priceChange.value >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {priceChange.value >= 0 ? "+" : ""}$
            {Math.abs(priceChange.value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={cn(
              "text-sm font-mono px-2 py-0.5 rounded",
              priceChange.percent >= 0
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {priceChange.percent >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(priceChange.percent).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 30%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="formattedDate"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              domain={[minValue, maxValue]}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(data.date, "MMM d, yyyy HH:mm")}
                    </p>
                    <p className="text-lg font-semibold font-mono text-foreground">
                      ${data.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {data.item_count && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.item_count} items
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(187, 85%, 53%)"
              strokeWidth={2}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info text */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Showing aggregated market data from last {data.days} days with normalized
        time intervals
      </p>
    </div>
  );
}
