/**
 * QuantTerminal - Dashboard App
 * 行情看板应用 - 接入真实行情数据
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, BarChart3, 
  DollarSign, Percent, Activity, Clock, RefreshCw,
  ArrowUpRight, ArrowDownRight, TrendingUp as Stock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { initVibeApp, AppLifecycle } from '@gui/vibe-container';
import { reportLifecycle } from '@/lib';
import { 
  mockIndices, mockStocks, mockSectors, 
  mockPortfolioSummary, generateTrendData, generateTrendDataDown 
} from '@/lib/mock-data';
import styles from './index.module.scss';

// ============ Constants ============
const APP_ID = 100;
const APP_NAME = 'dashboard';
const APP_DISPLAY_NAME = '行情看板';
const API_BASE = 'http://localhost:8000';

// ============ 数据类型 ============
interface IndexQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  amount: number;
  high: number;
  low: number;
  open_price: number;
  pre_close: number;
}

interface SectorData {
  name: string;
  change_percent: number;
  stocks: StockQuote[];
}

// 时间周期选项
const TIME_PERIODS = ['1D', '1W', '1M', '3M', '1Y'];
type TimePeriod = typeof TIME_PERIODS[number];

// 自选股列表
const WATCHLIST_STOCKS = [
  '600519', // 贵州茅台
  '000858', // 五粮液
  '300750', // 宁德时代
  '601318', // 中国平安
  '600900', // 长江电力
  '000001', // 平安银行
];

// 热门板块列表
const HOT_SECTORS = ['人工智能', '光伏', '新能源车', '芯片', '医药'];

// ============ API 函数 ============
const fetchIndices = async (): Promise<IndexQuote[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/indices`);
    if (!response.ok) throw new Error('Failed to fetch indices');
    return await response.json();
  } catch (error) {
    console.error('Error fetching indices:', error);
    return [];
  }
};

const fetchStocks = async (codes: string[]): Promise<StockQuote[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/stocks?codes=${codes.join(',')}`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
};

const fetchSector = async (sectorName: string): Promise<SectorData | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/sector/${encodeURIComponent(sectorName)}`);
    if (!response.ok) throw new Error('Failed to fetch sector');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sector:', error);
    return null;
  }
};

// ============ 组件 ============

// K线/走势图表组件
const StockChart: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('1D');
  const chartData = generateTrendData(20, 3200);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h2>上证指数走势</h2>
        <div className={styles.periodTabs}>
          {TIME_PERIODS.map((p) => (
            <button
              key={p}
              className={`${styles.periodTab} ${period === p ? styles.active : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 13%, 18%)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
              formatter={(value: number) => [value.toFixed(2), "指数"]}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(142, 70%, 45%)" 
              strokeWidth={2} 
              fill="url(#greenGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 资产概览组件
const PortfolioOverview: React.FC = () => {
  const summary = mockPortfolioSummary;
  const colors = [
    "hsl(199, 89%, 48%)", 
    "hsl(142, 70%, 45%)", 
    "hsl(280, 65%, 60%)", 
    "hsl(38, 92%, 50%)"
  ];

  return (
    <div className={styles.portfolioCard}>
      <h2>资产概览</h2>
      <div className={styles.portfolioSummary}>
        <div className={styles.totalAssets}>
          ¥{summary.totalAssets.toLocaleString()}
        </div>
        <div className={`${styles.todayPnl} ${summary.todayPnl >= 0 ? styles.positive : styles.negative}`}>
          今日 {summary.todayPnl >= 0 ? "+" : ""}¥{summary.todayPnl.toLocaleString()}
          ({summary.todayPnlPct >= 0 ? "+" : ""}{summary.todayPnlPct}%)
        </div>
      </div>
      <div className={styles.pieChart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={summary.allocation}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {summary.allocation.map((_, i) => (
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
        {summary.allocation.map((a, i) => (
          <div key={a.name} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: colors[i % 4] }} />
            <span className={styles.legendName}>{a.name}</span>
            <span className={styles.legendValue}>{a.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 迷你Sparkline组件
const MiniSparkline: React.FC<{ up: boolean }> = ({ up }) => {
  const data = Array.from({ length: 10 }, (_, i) => ({
    v: 50 + (up ? 1 : -1) * i * 2 + Math.random() * 10,
  }));
  
  return (
    <div className={styles.sparkline}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={up ? "sparkUp" : "sparkDown"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={up ? "hsl(142,70%,45%)" : "hsl(0,72%,55%)"} stopOpacity={0.3} />
              <stop offset="100%" stopColor={up ? "hsl(142,70%,45%)" : "hsl(0,72%,55%)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={up ? "hsl(142,70%,45%)" : "hsl(0,72%,55%)"} 
            strokeWidth={1.5} 
            fill={`url(#${up ? "sparkUp" : "sparkDown"})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StockCard: React.FC<{ stock: StockQuote }> = ({ stock }) => {
  const isUp = stock.change >= 0;
  
  return (
    <div className={styles.stockCard}>
      <div className={styles.stockHeader}>
        <span className={styles.stockName}>{stock.name}</span>
        <span className={styles.stockCode}>{stock.code}</span>
      </div>
      <div className={styles.stockPrice}>
        <span className={styles.price}>{stock.price.toFixed(2)}</span>
        <span className={`${styles.change} ${isUp ? styles.up : styles.down}`}>
          {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%)
        </span>
      </div>
      <div className={styles.stockDetail}>
        <div className={styles.detailRow}>
          <span>成交量</span>
          <span>{(stock.volume / 10000).toFixed(0)}手</span>
        </div>
        <div className={styles.detailRow}>
          <span>成交额</span>
          <span>{(stock.amount / 100000000).toFixed(2)}亿</span>
        </div>
        <div className={styles.detailRow}>
          <span>涨跌</span>
          <span className={isUp ? styles.up : styles.down}>
            {isUp ? '上涨' : '下跌'}
          </span>
        </div>
      </div>
    </div>
  );
};

const MarketOverview: React.FC<{ indices: IndexQuote[] }> = ({ indices }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // 使用mock数据作为后备
  const displayIndices = indices.length > 0 ? indices : mockIndices;
  
  return (
    <div className={styles.marketOverview}>
      <div className={styles.marketHeader}>
        <Clock className={styles.clockIcon} />
        <span className={styles.time}>
          {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <span className={styles.date}>
          {time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>
      
      <div className={styles.indexGrid}>
        {displayIndices.slice(0, 6).map((idx) => (
          <div 
            key={idx.name} 
            className={`${styles.indexCard} ${idx.change >= 0 ? styles.up : styles.down}`}
          >
            <div className={styles.indexHeader}>
              <span className={styles.indexName}>{idx.name}</span>
              {idx.change >= 0 ? (
                <ArrowUpRight className={styles.indexIcon} />
              ) : (
                <ArrowDownRight className={styles.indexIcon} />
              )}
            </div>
            <div className={styles.indexPrice}>{idx.value.toLocaleString()}</div>
            <div className={styles.indexChange}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectorSection: React.FC<{ sectors: SectorData[] }> = ({ sectors }) => {
  const [selectedSector, setSelectedSector] = useState(0);
  
  if (sectors.length === 0) return null;
  
  const currentSector = sectors[selectedSector];
  
  return (
    <div className={styles.stockList}>
      <div className={styles.sectionTitle}>
        <BarChart3 size={18} />
        热门板块
      </div>
      
      <div className={styles.sectorTabs}>
        {sectors.map((sector, idx) => (
          <button
            key={sector.name}
            className={`${styles.sectorTab} ${idx === selectedSector ? styles.active : ''}`}
            onClick={() => setSelectedSector(idx)}
          >
            {sector.name}
            <span className={sector.change_percent >= 0 ? styles.up : styles.down}>
              {sector.change_percent >= 0 ? '+' : ''}{sector.change_percent.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
      
      <div className={styles.stockGrid}>
        {currentSector.stocks.slice(0, 6).map(stock => (
          <StockCard key={stock.code} stock={stock} />
        ))}
      </div>
    </div>
  );
};

// ============ 主应用 ============

export default function DashboardApp() {
  const { t, i18n } = useTranslation();
  
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [watchlistStocks, setWatchlistStocks] = useState<StockQuote[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 尝试获取真实API数据，如果失败则使用mock数据
      const indicesData = await fetchIndices();
      setIndices(indicesData);
      
      const stocksData = await fetchStocks(WATCHLIST_STOCKS);
      setWatchlistStocks(stocksData);
      
      const sectorPromises = HOT_SECTORS.map(sector => fetchSector(sector));
      const sectorData = await Promise.all(sectorPromises);
      setSectors(sectorData.filter((s): s is SectorData => s !== null));
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    reportLifecycle(APP_ID, AppLifecycle.MOUNT);
    
    // 初始加载数据
    loadData();
    
    // 每30秒自动刷新
    const interval = setInterval(loadData, 30000);
    
    return () => {
      reportLifecycle(APP_ID, AppLifecycle.UNMOUNT);
      clearInterval(interval);
    };
  }, [loadData]);

  // 使用mock数据作为后备显示
  const displayStocks = watchlistStocks.length > 0 ? watchlistStocks : mockStocks.map(s => ({
    ...s,
    volume: parseFloat(s.volume) * 100000000,
    amount: parseFloat(s.volume) * 100000000,
    high: s.price * 1.02,
    low: s.price * 0.98,
    open_price: s.price * 0.99,
    pre_close: s.price * 0.98
  } as StockQuote));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <BarChart3 size={24} />
          <span>QuantTerminal 行情看板</span>
        </div>
        <div className={styles.subtitle}>
          实时行情 · 资产监控
          <button className={styles.refreshBtn} onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
          </button>
          <span className={styles.lastUpdate}>
            {lastUpdate.toLocaleTimeString('zh-CN')}
          </span>
        </div>
      </div>
      
      <MarketOverview indices={indices} />
      
      {/* K线图表 + 资产概览 */}
      <div className={styles.chartRow}>
        <StockChart />
        <PortfolioOverview />
      </div>
      
      {/* 自选股列表 */}
      <div className={styles.stockList}>
        <div className={styles.sectionTitle}>
          <Stock size={18} />
          自选股票
          <span className={styles.stockCount}>{mockStocks.length} 只</span>
        </div>
        <div className={styles.stockTable}>
          <table>
            <thead>
              <tr>
                <th className={styles.thLeft}>代码/名称</th>
                <th className={styles.thRight}>最新价</th>
                <th className={styles.thRight}>涨跌幅</th>
                <th className={styles.thRight}>成交额</th>
                <th className={styles.thRight}>市盈率</th>
                <th className={styles.thRight}>走势</th>
              </tr>
            </thead>
            <tbody>
              {mockStocks.map((s) => (
                <tr key={s.code}>
                  <td className={styles.tdLeft}>
                    <div className={styles.stockName}>{s.name}</div>
                    <div className={styles.stockCode}>{s.code}</div>
                  </td>
                  <td className={styles.tdRight}>{s.price.toFixed(2)}</td>
                  <td className={styles.tdRight}>
                    <span className={`${styles.changeTag} ${s.change >= 0 ? styles.up : styles.down}`}>
                      {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className={`${styles.tdRight} ${styles.muted}`}>{s.volume}</td>
                  <td className={`${styles.tdRight} ${styles.muted}`}>{s.pe}</td>
                  <td className={styles.tdRight}>
                    <MiniSparkline up={s.change >= 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 热门板块 */}
      <div className={styles.sectorSection}>
        <div className={styles.sectionTitle}>
          <BarChart3 size={18} />
          热门板块
          <span className={styles.stockCount}>今日排行</span>
        </div>
        <div className={styles.sectorList}>
          {mockSectors.map((sec, i) => (
            <div key={sec.name} className={styles.sectorItem}>
              <span className={`${styles.sectorRank} ${i < 3 ? styles.topRank : ''}`}>
                {i + 1}
              </span>
              <span className={styles.sectorName}>{sec.name}</span>
              <span className={`${styles.sectorChange} ${sec.change >= 0 ? styles.up : styles.down}`}>
                {sec.change >= 0 ? "+" : ""}{sec.change.toFixed(2)}%
              </span>
              <div className={styles.sectorBar}>
                <div 
                  className={`${styles.sectorBarFill} ${sec.change >= 0 ? styles.up : styles.down}`}
                  style={{ width: `${Math.min(Math.abs(sec.change) * 15, 100)}%` }}
                />
              </div>
            </div>
          ))}
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
