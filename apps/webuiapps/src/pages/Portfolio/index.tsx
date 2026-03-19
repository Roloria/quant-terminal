/**
 * QuantTerminal - Portfolio App
 * 投资组合应用 - 持仓管理、盈亏分析
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, 
  Wallet, Activity, BarChart3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { initVibeApp } from '@gui/vibe-container';
import { mockPortfolioHoldings, mockPortfolioSummary } from '@/lib/mock-data';
import styles from './index.module.scss';

// ============ 常量 ============
const APP_ID = 101;
const APP_NAME = 'portfolio';
const APP_DISPLAY_NAME = '投资组合';

// ============ 组件 ============

const StatCard: React.FC<{
  label: string; 
  value: string; 
  sub?: string; 
  positive?: boolean;
  icon: React.ReactNode;
}> = ({ label, value, sub, positive, icon }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {sub && (
          <div className={`${styles.statSub} ${positive ? styles.positive : styles.negative}`}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

const HoldingsTable: React.FC<{ holdings: typeof mockPortfolioHoldings }> = ({ holdings }) => {
  return (
    <div className={styles.holdingsTable}>
      <div className={styles.sectionHeader}>
        <BarChart3 size={18} />
        <h2>持仓明细</h2>
      </div>
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th className={styles.thLeft}>股票</th>
              <th className={styles.thRight}>持仓</th>
              <th className={styles.thRight}>现价</th>
              <th className={styles.thRight}>成本</th>
              <th className={styles.thRight}>盈亏</th>
              <th className={styles.thRight}>仓位</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.code}>
                <td className={styles.tdLeft}>
                  <div className={styles.stockName}>{h.name}</div>
                  <div className={styles.stockCode}>{h.code}</div>
                </td>
                <td className={styles.tdRight}>{h.shares}</td>
                <td className={styles.tdRight}>{h.currentPrice.toFixed(2)}</td>
                <td className={`${styles.tdRight} ${styles.muted}`}>{h.costPrice.toFixed(2)}</td>
                <td className={styles.tdRight}>
                  <div className={`${styles.pnlValue} ${h.pnl >= 0 ? styles.positive : styles.negative}`}>
                    {h.pnl >= 0 ? "+" : ""}{h.pnl.toLocaleString()}
                  </div>
                  <div className={`${styles.pnlPct} ${h.pnlPct >= 0 ? styles.positive : styles.negative}`}>
                    {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%
                  </div>
                </td>
                <td className={styles.tdRight}>
                  <div className={styles.weightCell}>
                    <div className={styles.weightBar}>
                      <div 
                        className={styles.weightFill} 
                        style={{ width: `${h.weight}%` }}
                      />
                    </div>
                    <span className={styles.weightValue}>{h.weight}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PnLChart: React.FC<{ holdings: typeof mockPortfolioHoldings }> = ({ holdings }) => {
  return (
    <div className={styles.pnlChart}>
      <div className={styles.sectionHeader}>
        <BarChart3 size={18} />
        <h2>个股盈亏</h2>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={holdings} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }} 
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10, fill: "hsl(210, 20%, 90%)" }} 
              width={60} 
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 13%, 18%)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
              formatter={(value: number) => [`¥${value.toLocaleString()}`, "盈亏"]}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {holdings.map((entry) => (
                <Cell 
                  key={entry.code} 
                  fill={entry.pnl >= 0 ? "hsl(142, 70%, 45%)" : "hsl(0, 72%, 55%)"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AllocationChart: React.FC<{ allocation: typeof mockPortfolioSummary.allocation }> = ({ allocation }) => {
  const colors = [
    "hsl(199, 89%, 48%)", 
    "hsl(142, 70%, 45%)", 
    "hsl(280, 65%, 60%)", 
    "hsl(38, 92%, 50%)"
  ];

  return (
    <div className={styles.allocationChart}>
      <div className={styles.sectionHeader}>
        <PieChartIcon size={18} />
        <h2>资产配置</h2>
      </div>
      <div className={styles.pieContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {allocation.map((_, i) => (
                <Cell key={i} fill={colors[i % 4]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 13%, 18%)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.allocationLegend}>
        {allocation.map((a, i) => (
          <div key={a.name} className={styles.legendItem}>
            <div 
              className={styles.legendDot} 
              style={{ background: colors[i % 4] }} 
            />
            <span className={styles.legendName}>{a.name}</span>
            <span className={styles.legendValue}>{a.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ 主应用 ============

export default function PortfolioApp() {
  const summary = mockPortfolioSummary;
  const holdings = mockPortfolioHoldings;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Wallet size={24} />
          <span>QuantTerminal 投资组合</span>
        </div>
        <div className={styles.subtitle}>
          持仓管理 · 盈亏分析 · 风险评估
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <StatCard 
          label="总资产" 
          value={`¥${summary.totalAssets.toLocaleString()}`}
          icon={<Wallet size={20} />}
        />
        <StatCard 
          label="今日盈亏" 
          value={`${summary.todayPnl >= 0 ? "+" : ""}¥${summary.todayPnl.toLocaleString()}`}
          sub={`${summary.todayPnlPct >= 0 ? "+" : ""}${summary.todayPnlPct}%`}
          positive={summary.todayPnl >= 0}
          icon={<Activity size={20} />}
        />
        <StatCard 
          label="累计盈亏" 
          value={`+¥${summary.totalPnl.toLocaleString()}`}
          sub={`+${summary.totalPnlPct}%`}
          positive={true}
          icon={<TrendingUp size={20} />}
        />
        <StatCard 
          label="持仓数量" 
          value={`${holdings.length} 只`}
          icon={<BarChart3 size={20} />}
        />
      </div>

      <div className={styles.contentGrid}>
        {/* 持仓明细表格 */}
        <div className={styles.holdingsSection}>
          <HoldingsTable holdings={holdings} />
        </div>

        {/* 右侧图表 */}
        <div className={styles.chartsSection}>
          <PnLChart holdings={holdings} />
          <AllocationChart allocation={summary.allocation} />
        </div>
      </div>
    </div>
  );
}

// ============ Vite App Init ============
initVibeApp({
  appId: APP_ID,
  appName: APP_NAME,
  displayName: APP_DISPLAY_NAME,
});
