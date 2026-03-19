/**
 * QuantTerminal Mock Data
 * 模拟数据 - 用于开发和测试
 */

// 指数数据
export const mockIndices = [
  { name: "上证指数", value: 3284.16, change: 1.23, changeValue: 39.89 },
  { name: "深证成指", value: 10547.82, change: 0.87, changeValue: 90.92 },
  { name: "创业板指", value: 2156.33, change: -0.45, changeValue: -9.76 },
  { name: "科创50", value: 986.42, change: 2.15, changeValue: 20.77 },
  { name: "恒生指数", value: 22145.60, change: 0.56, changeValue: 123.21 },
  { name: "纳斯达克", value: 18432.75, change: -0.32, changeValue: -59.78 },
];

// 自选股列表
export const mockStocks = [
  { code: "600519", name: "贵州茅台", price: 1688.00, change: 2.35, volume: "28.6亿", pe: "32.5" },
  { code: "000858", name: "五粮液", price: 142.56, change: 1.87, volume: "15.2亿", pe: "22.8" },
  { code: "300750", name: "宁德时代", price: 198.30, change: -1.23, volume: "42.1亿", pe: "28.6" },
  { code: "601318", name: "中国平安", price: 48.92, change: 0.65, volume: "18.9亿", pe: "8.5" },
  { code: "000001", name: "平安银行", price: 12.35, change: -0.81, volume: "12.3亿", pe: "5.2" },
  { code: "600036", name: "招商银行", price: 35.78, change: 1.12, volume: "22.7亿", pe: "6.8" },
  { code: "002594", name: "比亚迪", price: 267.45, change: 3.56, volume: "56.8亿", pe: "35.2" },
  { code: "601899", name: "紫金矿业", price: 15.23, change: -2.14, volume: "31.5亿", pe: "12.1" },
  { code: "688981", name: "中芯国际", price: 56.78, change: 4.23, volume: "38.9亿", pe: "45.6" },
  { code: "603259", name: "药明康德", price: 52.10, change: -0.96, volume: "16.4亿", pe: "18.3" },
];

// 热门板块
export const mockSectors = [
  { name: "人工智能", change: 5.23 },
  { name: "半导体", change: 4.12 },
  { name: "新能源汽车", change: 3.45 },
  { name: "光伏", change: 2.87 },
  { name: "军工", change: 1.56 },
  { name: "医药生物", change: 0.78 },
  { name: "白酒", change: 0.45 },
  { name: "房地产", change: -1.23 },
  { name: "银行", change: -0.56 },
  { name: "钢铁", change: -2.34 },
];

// 资产概览
export const mockPortfolioSummary = {
  totalAssets: 1256789.45,
  todayPnl: 12568.32,
  todayPnlPct: 1.01,
  totalPnl: 156789.45,
  totalPnlPct: 14.25,
  allocation: [
    { name: "A股", value: 45 },
    { name: "港股", value: 25 },
    { name: "基金", value: 20 },
    { name: "现金", value: 10 },
  ],
};

// 持仓明细
export const mockPortfolioHoldings = [
  { code: "600519", name: "贵州茅台", shares: 100, costPrice: 1580.00, currentPrice: 1688.00, pnl: 10800, pnlPct: 6.84, weight: 25.2 },
  { code: "300750", name: "宁德时代", shares: 500, costPrice: 210.50, currentPrice: 198.30, pnl: -6100, pnlPct: -5.80, weight: 14.8 },
  { code: "002594", name: "比亚迪", shares: 300, costPrice: 245.00, currentPrice: 267.45, pnl: 6735, pnlPct: 9.16, weight: 12.0 },
  { code: "601318", name: "中国平安", shares: 2000, costPrice: 52.30, currentPrice: 48.92, pnl: -6760, pnlPct: -6.46, weight: 14.6 },
  { code: "688981", name: "中芯国际", shares: 800, costPrice: 48.50, currentPrice: 56.78, pnl: 6624, pnlPct: 17.07, weight: 6.8 },
  { code: "600036", name: "招商银行", shares: 1500, costPrice: 33.20, currentPrice: 35.78, pnl: 3870, pnlPct: 7.77, weight: 8.0 },
];

// K线数据生成函数
export interface KLineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 生成模拟K线数据
export function generateKLineData(days: number = 60, basePrice: number = 3200): KLineData[] {
  const data: KLineData[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.48) * 30;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * 15;
    const low = Math.min(open, close) - Math.random() * 15;
    const volume = Math.floor(Math.random() * 50000000) + 10000000;
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
}

// 生成走势数据（用于折线图）
export interface TrendData {
  time: number;
  value: number;
}

export function generateTrendData(points: number = 20, baseValue: number = 3200): TrendData[] {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: baseValue + Math.random() * 100 + i * 3,
  }));
}

export function generateTrendDataDown(points: number = 20, baseValue: number = 2200): TrendData[] {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: baseValue - Math.random() * 50 + Math.sin(i * 0.5) * 30,
  }));
}

// ============ 舆情监控数据 ============

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: SentimentType;
  tags: string[];
  url?: string;
}

// 舆情资讯
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '人工智能芯片需求爆发 台积电产能供不应求',
    source: '证券时报',
    time: '10分钟前',
    sentiment: 'positive',
    tags: ['AI', '半导体', '芯片'],
  },
  {
    id: '2',
    title: '新能源车销量增速放缓 产业链面临库存压力',
    source: '第一财经',
    time: '25分钟前',
    sentiment: 'negative',
    tags: ['新能源车', '产业链'],
  },
  {
    id: '3',
    title: '央行降准预期升温 货币政策空间有望打开',
    source: '财新网',
    time: '1小时前',
    sentiment: 'positive',
    tags: ['宏观', '金融'],
  },
  {
    id: '4',
    title: '半导体设备出口管制升级 国产替代进程加速',
    source: '中国证券报',
    time: '1小时前',
    sentiment: 'positive',
    tags: ['半导体', '国产替代'],
  },
  {
    id: '5',
    title: '白酒消费淡季需求疲软 龙头酒企承压',
    source: '每日经济新闻',
    time: '2小时前',
    sentiment: 'negative',
    tags: ['消费', '白酒'],
  },
  {
    id: '6',
    title: '光伏组件价格企稳 装机需求有望回暖',
    source: '上海证券报',
    time: '2小时前',
    sentiment: 'neutral',
    tags: ['光伏', '新能源'],
  },
  {
    id: '7',
    title: '大模型应用加速落地 互联网巨头竞相加码',
    source: '证券日报',
    time: '3小时前',
    sentiment: 'positive',
    tags: ['AI', '互联网'],
  },
  {
    id: '8',
    title: '医药集采价格降幅超预期 板块整体承压',
    source: '21世纪经济报道',
    time: '3小时前',
    sentiment: 'negative',
    tags: ['医药', '集采'],
  },
  {
    id: '9',
    title: '芯片法案补贴细则落地 半导体行业迎利好',
    source: '经济参考报',
    time: '4小时前',
    sentiment: 'positive',
    tags: ['半导体', '政策'],
  },
  {
    id: '10',
    title: '房地产调控政策持续优化 市场信心逐步恢复',
    source: '人民日报',
    time: '4小时前',
    sentiment: 'neutral',
    tags: ['宏观', '房地产'],
  },
  {
    id: '11',
    title: '5G基站建设加速推进 通信设备商受益',
    source: '通信产业报',
    time: '5小时前',
    sentiment: 'positive',
    tags: ['5G', '通信'],
  },
  {
    id: '12',
    title: '铁矿石价格高位回落 钢铁行业利润承压',
    source: '期货日报',
    time: '5小时前',
    sentiment: 'negative',
    tags: ['钢铁', '大宗商品'],
  },
];

// 热点话题
export interface HotTopic {
  rank: number;
  tag: string;
  heat: number;
  trend: 'up' | 'down' | 'stable';
}

export const mockHotTopics: HotTopic[] = [
  { rank: 1, tag: 'AI', heat: 9850, trend: 'up' },
  { rank: 2, tag: '半导体', heat: 8620, trend: 'up' },
  { rank: 3, tag: '新能源车', heat: 7845, trend: 'down' },
  { rank: 4, tag: '光伏', heat: 6520, trend: 'stable' },
  { rank: 5, tag: '医药', heat: 5480, trend: 'up' },
  { rank: 6, tag: '白酒', heat: 4230, trend: 'down' },
  { rank: 7, tag: '房地产', heat: 3890, trend: 'stable' },
  { rank: 8, tag: '5G', heat: 3250, trend: 'up' },
];
