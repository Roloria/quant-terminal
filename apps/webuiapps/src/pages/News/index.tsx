/**
 * QuantTerminal - News App
 * 舆情监控应用 - 资讯列表、情绪分析、热点追踪
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, ExternalLink, 
  Filter, Flame, BarChart3, Clock
} from 'lucide-react';
import { initVibeApp } from '@gui/vibe-container';
import { mockNews, mockHotTopics, NewsItem, SentimentType, HotTopic } from '@/lib/mock-data';
import styles from './index.module.scss';

// ============ 常量 ============
const APP_ID = 103;
const APP_NAME = 'news';
const APP_DISPLAY_NAME = '舆情监控';

// ============ 配置 ============
const sentimentConfig: Record<SentimentType, { icon: typeof TrendingUp; label: string; className: string }> = {
  positive: { icon: TrendingUp, label: "利好", className: styles.positive },
  negative: { icon: TrendingDown, label: "利空", className: styles.negative },
  neutral: { icon: Minus, label: "中性", className: styles.neutral },
};

// ============ 组件 ============

// 情绪统计卡片
const SentimentCard: React.FC<{ sentiment: SentimentType; count: number }> = ({ sentiment, count }) => {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;
  
  return (
    <div className={`${styles.sentimentCard} ${config.className}`}>
      <div className={styles.sentimentIcon}>
        <Icon size={20} />
      </div>
      <div className={styles.sentimentInfo}>
        <span className={styles.sentimentLabel}>{config.label}消息</span>
        <span className={styles.sentimentCount}>{count}</span>
      </div>
    </div>
  );
};

// 标签筛选
const TagFilter: React.FC<{
  tags: string[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
}> = ({ tags, activeTag, onTagClick }) => {
  return (
    <div className={styles.tagFilter}>
      <button
        onClick={() => onTagClick(null)}
        className={`${styles.tagBtn} ${!activeTag ? styles.active : ''}`}
      >
        全部
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagClick(tag === activeTag ? null : tag)}
          className={`${styles.tagBtn} ${tag === activeTag ? styles.active : ''}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

// 资讯卡片
const NewsCard: React.FC<{ news: NewsItem }> = ({ news }) => {
  const config = sentimentConfig[news.sentiment];
  const Icon = config.icon;
  
  return (
    <div className={styles.newsCard}>
      <div className={styles.newsHeader}>
        <div className={`${styles.sentimentBadge} ${config.className}`}>
          <Icon size={14} />
          <span>{config.label}</span>
        </div>
        <div className={styles.newsMeta}>
          <span className={styles.newsSource}>{news.source}</span>
          <span className={styles.newsTime}>{news.time}</span>
        </div>
      </div>
      
      <h3 className={styles.newsTitle}>{news.title}</h3>
      
      <div className={styles.newsFooter}>
        <div className={styles.newsTags}>
          {news.tags.map(tag => (
            <span key={tag} className={styles.newsTag}>{tag}</span>
          ))}
        </div>
        <ExternalLink size={16} className={styles.newsLink} />
      </div>
    </div>
  );
};

// 热点排行
const HotTopics: React.FC<{ topics: HotTopic[] }> = ({ topics }) => {
  const getTrendIcon = (trend: HotTopic['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} />;
      case 'down': return <TrendingDown size={12} />;
      default: return <Minus size={12} />;
    }
  };
  
  const getTrendClass = (trend: HotTopic['trend']) => {
    switch (trend) {
      case 'up': return styles.trendUp;
      case 'down': return styles.trendDown;
      default: return styles.trendStable;
    }
  };
  
  return (
    <div className={styles.hotTopics}>
      <div className={styles.hotHeader}>
        <Flame size={18} />
        <h3>热点排行</h3>
      </div>
      <div className={styles.topicList}>
        {topics.map(topic => (
          <div key={topic.tag} className={styles.topicItem}>
            <span className={`${styles.topicRank} ${topic.rank <= 3 ? styles.topRank : ''}`}>
              {topic.rank}
            </span>
            <span className={styles.topicTag}>{topic.tag}</span>
            <span className={`${styles.topicHeat} ${getTrendClass(topic.trend)}`}>
              {getTrendIcon(topic.trend)}
              {topic.heat.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ 主应用 ============

export default function NewsApp() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // 获取所有标签
  const allTags = [...new Set(mockNews.flatMap(n => n.tags))];
  
  // 筛选资讯
  const filteredNews = activeTag 
    ? mockNews.filter(n => n.tags.includes(activeTag))
    : mockNews;
  
  // 情绪统计
  const sentimentCounts = {
    positive: mockNews.filter(n => n.sentiment === 'positive').length,
    negative: mockNews.filter(n => n.sentiment === 'negative').length,
    neutral: mockNews.filter(n => n.sentiment === 'neutral').length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <BarChart3 size={24} />
          <span>QuantTerminal 舆情监控</span>
        </div>
        <div className={styles.subtitle}>
          实时资讯 · 情绪分析 · 热点追踪
        </div>
      </div>

      {/* 情绪统计 */}
      <div className={styles.sentimentGrid}>
        <SentimentCard sentiment="positive" count={sentimentCounts.positive} />
        <SentimentCard sentiment="negative" count={sentimentCounts.negative} />
        <SentimentCard sentiment="neutral" count={sentimentCounts.neutral} />
      </div>

      <div className={styles.mainContent}>
        {/* 左侧资讯列表 */}
        <div className={styles.newsSection}>
          {/* 标签筛选 */}
          <TagFilter 
            tags={allTags}
            activeTag={activeTag}
            onTagClick={setActiveTag}
          />
          
          {/* 资讯列表 */}
          <div className={styles.newsList}>
            {filteredNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
          
          {filteredNews.length === 0 && (
            <div className={styles.emptyState}>
              <Filter size={48} className={styles.emptyIcon} />
              <p>暂无相关资讯</p>
            </div>
          )}
        </div>
        
        {/* 右侧热点排行 */}
        <div className={styles.sidebar}>
          <HotTopics topics={mockHotTopics} />
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
