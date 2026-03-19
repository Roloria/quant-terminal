/**
 * QuantTerminal - Dashboard App
 * 行情看板应用 - 接入真实行情数据
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Stock, BarChart3, 
  DollarSign, Percent, Activity, Clock, RefreshCw
} from 'lucide-react';
import { initVibeApp, AppLifecycle } from '@gui/vibe-container';
import { reportLifecycle } from '@/lib';
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
  
  const shIndex = indices.find(i => i.code === '000001');
  const szIndex = indices.find(i => i.code === '399001');
  const cyIndex = indices.find(i => i.code === '399006');
  
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
        {shIndex && (
          <div className={`${styles.indexCard} ${shIndex.change >= 0 ? styles.up : styles.down}`}>
            <div className={styles.indexName}>上证指数</div>
            <div className={styles.indexPrice}>{shIndex.price.toFixed(2)}</div>
            <div className={styles.indexChange}>
              {shIndex.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {shIndex.change >= 0 ? '+' : ''}{shIndex.change.toFixed(2)} ({shIndex.change >= 0 ? '+' : ''}{shIndex.change_percent.toFixed(2)}%)
            </div>
          </div>
        )}
        
        {szIndex && (
          <div className={`${styles.indexCard} ${szIndex.change >= 0 ? styles.up : styles.down}`}>
            <div className={styles.indexName}>深证成指</div>
            <div className={styles.indexPrice}>{szIndex.price.toFixed(2)}</div>
            <div className={styles.indexChange}>
              {szIndex.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {szIndex.change >= 0 ? '+' : ''}{szIndex.change.toFixed(2)} ({szIndex.change >= 0 ? '+' : ''}{szIndex.change_percent.toFixed(2)}%)
            </div>
          </div>
        )}

        {cyIndex && (
          <div className={`${styles.indexCard} ${cyIndex.change >= 0 ? styles.up : styles.down}`}>
            <div className={styles.indexName}>创业板指</div>
            <div className={styles.indexPrice}>{cyIndex.price.toFixed(2)}</div>
            <div className={styles.indexChange}>
              {cyIndex.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {cyIndex.change >= 0 ? '+' : ''}{cyIndex.change.toFixed(2)} ({cyIndex.change >= 0 ? '+' : ''}{cyIndex.change_percent.toFixed(2)}%)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PortfolioSummary: React.FC = () => {
  // 模拟资产数据
  const total = 600000;
  const position = 330000;
  const cash = 270000;
  const positionRatio = (position / total * 100).toFixed(1);
  const todayPL = 1250;
  
  return (
    <div className={styles.portfolio}>
      <div className={styles.portfolioTitle}>
        <DollarSign size={18} />
        资产概要
      </div>
      <div className={styles.portfolioGrid}>
        <div className={styles.portfolioItem}>
          <span className={styles.portfolioLabel}>总资产</span>
          <span className={styles.portfolioValue}>{(total / 10000).toFixed(1)}万</span>
        </div>
        <div className={styles.portfolioItem}>
          <span className={styles.portfolioLabel}>持仓市值</span>
          <span className={styles.portfolioValue}>{(position / 10000).toFixed(1)}万</span>
        </div>
        <div className={styles.portfolioItem}>
          <span className={styles.portfolioLabel}>现金余额</span>
          <span className={styles.portfolioValue}>{(cash / 10000).toFixed(1)}万</span>
        </div>
        <div className={styles.portfolioItem}>
          <span className={styles.portfolioLabel}>持仓仓位</span>
          <span className={styles.portfolioValue}>{positionRatio}%</span>
        </div>
      </div>
      <div className={`${styles.todayPL} ${todayPL >= 0 ? styles.up : styles.down}`}>
        <Activity size={16} />
        今日 {todayPL >= 0 ? '盈利' : '亏损'} {Math.abs(todayPL).toFixed(2)} 元
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
      // 获取指数数据
      const indicesData = await fetchIndices();
      setIndices(indicesData);
      
      // 获取自选股数据
      const stocksData = await fetchStocks(WATCHLIST_STOCKS);
      setWatchlistStocks(stocksData);
      
      // 获取板块数据
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
      
      <PortfolioSummary />
      
      <div className={styles.stockList}>
        <div className={styles.sectionTitle}>
          <Stock size={18} />
          自选股票
        </div>
        <div className={styles.stockGrid}>
          {watchlistStocks.map(stock => (
            <StockCard key={stock.code} stock={stock} />
          ))}
        </div>
      </div>
      
      <SectorSection sectors={sectors} />
    </div>
  );
}

// ============ Vite App Init ============
initVibeApp({
  appId: APP_ID,
  appName: APP_NAME,
  displayName: APP_DISPLAY_NAME,
});
