"use client"

import { ChartContainer } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type DailyJoinsChartProps = {
  data: { date: string; count: number }[]
}

export function DailyJoinsChart({ data }: DailyJoinsChartProps) {
  return (
    <ChartContainer
      config={{
        count: {
          label: "Candidates",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}