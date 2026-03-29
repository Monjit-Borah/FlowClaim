"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { Card } from "@/components/ui/card";

const piePalette = ["#13110f", "#4f473f", "#8a7b67", "#c79a3b", "#e6d2a4"];

export function SpendTrendChart({
  data,
  title
}: {
  data: { month: string; value: number }[];
  title: string;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#c79a3b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#c79a3b" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ddd4ca" strokeDasharray="4 4" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#7b7267", fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#13110f" fill="url(#spendGradient)" strokeWidth={2.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SpendBreakdownChart({
  data,
  title
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={68} outerRadius={95} dataKey="value" paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: piePalette[index % piePalette.length] }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="text-muted">{entry.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
