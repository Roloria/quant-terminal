/**
 * QuantTerminal - StockPicker App
 * 智能选股应用 - 多维度筛选、自选股收藏
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { initVibeApp } from '@gui/vibe-container';
import { mockStocks } from '@/lib/mock-data';
import styles from './index.module.scss';

// ============ 常量 ============
const APP_ID = 102;
const APP_NAME = 'stockpicker';
const APP_DISPLAY_NAME = '智能选股';

// ============ 类型 ============
interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  pe: string;
  roe?: string;
  marketCap?: string;
}

// 筛选条件
interface FilterOption {
  label: string;
  active: boolean;
  filter: (stock: Stock) => boolean;
}

// 预定义筛选条件
const filterOptions: FilterOption[] = [
  { 
    label: "市盈率 < 20", 
    active: false,
    filter: (s) => parseFloat(s.pe) < 20 
  },
  { 
    label: "ROE > 15%", 
    active: false,
    filter: (s) => s.roe ? parseFloat(s.roe.replace('%', '')) > 15 : false
  },
  { 
    label: "市值 > 500亿", 
    active: false,
    filter: (s) => s.marketCap ? parseFloat(s.marketCap.replace('亿', '')) > 500 : false
  },
  { 
    label: "近5日涨幅 > 3%", 
    active: false,
    filter: (s) => s.change > 3
  },
  { 
    label: "量比 > 2", 
    active: false,
    filter: (s) => parseFloat(s.volume.replace('亿', '')) > 20
  },
];

// ============ 组件 ============

// 搜索和筛选栏
const SearchBar: React.FC<{
  search: string;
  onSearchChange: (v: string) => void;
  filters: FilterOption[];
  onToggleFilter: (i: number) => void;
}> = ({ search, onSearchChange, filters, onToggleFilter }) => {
  return (
    <div className={styles.searchSection}>
      <div className={styles.searchRow}>
        <div className={styles.searchInput}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索股票代码或名称..."
            className={styles.input}
          />
        </div>
        <button className={styles.advancedBtn}>
          <SlidersHorizontal size={16} />
          高级筛选
        </button>
      </div>
      
      <div className={styles.filterTags}>
        {filters.map((f, i) => (
          <button
            key={f.label}
            onClick={() => onToggleFilter(i)}
            className={`${styles.filterTag} ${f.active ? styles.active : ''}`}
          >
            <Filter size={12} />
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// 股票表格
const StockTable: React.FC<{
  stocks: Stock[];
  favorites: Set<string>;
  onToggleFavorite: (code: string) => void;
}> = ({ stocks, favorites, onToggleFavorite }) => {
  if (stocks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Search size={48} className={styles.emptyIcon} />
        <p>暂无符合条件的股票</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thLeft}>代码/名称</th>
            <th className={styles.thRight}>最新价</th>
            <th className={styles.thRight}>涨跌幅</th>
            <th className={styles.thRight}>市盈率</th>
            <th className={styles.thRight}>成交额</th>
            <th className={styles.thCenter}>操作</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isUp = stock.change >= 0;
            const isFav = favorites.has(stock.code);
            return (
              <tr key={stock.code}>
                <td className={styles.tdLeft}>
                  <div className={styles.stockName}>{stock.name}</div>
                  <div className={styles.stockCode}>{stock.code}</div>
                </td>
                <td className={styles.tdRight}>
                  <span className={styles.price}>{stock.price.toFixed(2)}</span>
                </td>
                <td className={styles.tdRight}>
                  <span className={`${styles.changeTag} ${isUp ? styles.up : styles.down}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isUp ? "+" : ""}{stock.change.toFixed(2)}%
                  </span>
                </td>
                <td className={styles.tdRight}>
                  <span className={styles.muted}>{stock.pe}</span>
                </td>
                <td className={styles.tdRight}>
                  <span className={styles.muted}>{stock.volume}</span>
                </td>
                <td className={styles.tdCenter}>
                  <button 
                    className={`${styles.favoriteBtn} ${isFav ? styles.favorited : ''}`}
                    onClick={() => onToggleFavorite(stock.code)}
                  >
                    <Star size={16} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// 统计摘要
const StatsSummary: React.FC<{ total: number; filtered: number }> = ({ total, filtered }) => {
  return (
    <div className={styles.statsBar}>
      <div className={styles.statsInfo}>
        <span className={styles.statsLabel}>筛选结果</span>
        <span className={styles.statsCount}>共 {filtered} 只符合条件 (总计 {total} 只)</span>
      </div>
    </div>
  );
};

// ============ 主应用 ============

export default function StockPickerApp() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(filterOptions);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 切换筛选条件
  const toggleFilter = (i: number) => {
    setFilters(f => f.map((item, idx) => 
      idx === i ? { ...item, active: !item.active } : item
    ));
  };

  // 切换收藏
  const toggleFavorite = (code: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // 筛选股票
  const filteredStocks = mockStocks.filter(stock => {
    // 关键词搜索
    if (search && !stock.name.includes(search) && !stock.code.includes(search)) {
      return false;
    }
    
    // 筛选条件
    for (const f of filters) {
      if (f.active && !f.filter(stock)) {
        return false;
      }
    }
    
    return true;
  });

  // 活跃筛选数量
  const activeFilters = filters.filter(f => f.active).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Search size={24} />
          <span>QuantTerminal 智能选股</span>
        </div>
        <div className={styles.subtitle}>
          多维度筛选 · AI 推荐 · 条件预警
        </div>
      </div>

      {/* 搜索和筛选 */}
      <SearchBar 
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onToggleFilter={toggleFilter}
      />

      {/* 统计摘要 */}
      <StatsSummary total={mockStocks.length} filtered={filteredStocks.length} />

      {/* 结果表格 */}
      <div className={styles.resultsSection}>
        <div className={styles.sectionHeader}>
          <h2>筛选结果</h2>
          {activeFilters > 0 && (
            <span className={styles.activeFilterBadge}>
              {activeFilters} 个筛选条件
            </span>
          )}
        </div>
        <StockTable 
          stocks={filteredStocks}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      {/* 自选股提示 */}
      {favorites.size > 0 && (
        <div className={styles.favoritesHint}>
          已收藏 {favorites.size} 只股票到自选股
        </div>
      )}
    </div>
  );
}

// ============ Vite App Init ============
initVibeApp({
  appId: APP_ID,
  appName: APP_NAME,
  displayName: APP_DISPLAY_NAME,
});
