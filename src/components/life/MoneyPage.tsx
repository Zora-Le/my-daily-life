import type { LifeState } from '@/hooks/useLifeStore';
import { safeCalculate } from '@/lib/lifeUtils';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
const data = [
  { month: '5月', income: 15.2, expense: 9.1 },
  { month: '6月', income: 16.8, expense: 10.6 },
  { month: '7月', income: 16.1, expense: 8.8 },
  { month: '8月', income: 18.4, expense: 11.2 },
  { month: '9月', income: 17.6, expense: 9.4 },
  { month: '10月', income: 19.3, expense: 9.8 },
];
type Saving = LifeState['savings'][number];
export function MoneyPage({
  savings,
  onSavings,
  notify,
}: {
  savings: Saving[];
  onSavings: (items: Saving[]) => void;
  notify: (text: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const commit = (item: Saving) => {
    try {
      const value = safeCalculate(draft);
      onSavings(
        savings.map(s =>
          s.id === item.id ? { ...s, expression: draft, value } : s,
        ),
      );
      setEditing(null);
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const total = savings.reduce((sum, item) => sum + item.value, 0);
  return (
    <>
      <section className="savings-card narrow">
        <div className="savings-top">
          <div>
            <span className="overline">PLATFORM SAVINGS</span>
            <h2>平台储蓄</h2>
          </div>
          <small>点击岛屿直接计算</small>
        </div>
        <div className="island-map">
          <div className="wave wave-one" />
          <div className="wave wave-two" />
          {savings.map((item, i) => (
            <article
              className={`paper-island island-${['one', 'two', 'three'][i]}`}
              key={item.id}
              onClick={() => {
                setEditing(item.id);
                setDraft(item.expression);
              }}
            >
              {editing === item.id ? (
                <input
                  value={draft}
                  inputMode="decimal"
                  onChange={e => setDraft(e.target.value)}
                  onBlur={() => commit(item)}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <b>¥ {item.value.toLocaleString()}</b>
              )}
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
        <p className="savings-total">
          总储蓄 <strong>{total.toLocaleString()}</strong> 元
        </p>
        <p className="expression-tip">支持 =1239+1349+16700、括号与四则运算</p>
      </section>
      <section className="life-section">
        <div className="section-heading">
          <div>
            <h2>月度收支</h2>
            <p>最近六个月 · 单位：千元</p>
          </div>
          <span className="bar-legend">
            <i />
            收入
            <i />
            支出
          </span>
        </div>
        <div className="money-chart">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={data}
              barGap={4}
              margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid stroke="#ece9e3" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#85827d', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#aaa59d', fontSize: 9 }}
              />
              <Tooltip
                cursor={{ fill: '#f6f3ed' }}
                formatter={v => `¥${Number(v).toFixed(1)}k`}
                contentStyle={{
                  border: '1px solid #ddd8cf',
                  borderRadius: 12,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="income"
                name="收入"
                fill="#8797a0"
                radius={[5, 5, 2, 2]}
                maxBarSize={16}
              />
              <Bar
                dataKey="expense"
                name="支出"
                fill="#d4a99e"
                radius={[5, 5, 2, 2]}
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="money-footnote">
        <span>OCTOBER</span>
        <p>
          <b>19,300</b> 元收入
        </p>
        <i />
        <p>
          <b>9,800</b> 元支出
        </p>
      </section>
    </>
  );
}
