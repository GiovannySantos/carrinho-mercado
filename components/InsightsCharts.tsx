'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export type InsightData = {
  label: string;
  value: number;
};

export type PriceHistory = {
  date: string;
  value: number;
};

type Props = {
  topProductsByValue: InsightData[];
  topProductsByQuantity: InsightData[];
  topCategories: InsightData[];
  priceHistory: PriceHistory[];
};

export default function InsightsCharts({
  topProductsByValue,
  topProductsByQuantity,
  topCategories,
  priceHistory
}: Props) {
  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold">Top produtos por valor</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsByValue}>
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold">Top produtos por quantidade</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsByQuantity}>
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#334155" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold">Top categorias por valor</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCategories}>
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold">Histórico de preço do produto</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
