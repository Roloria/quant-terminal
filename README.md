# QuantTerminal - 浏览器版量化投资操作系统

> 基于 OpenRoom 开发的个人量化投资工作台

## 🎯 项目目标

打造一个浏览器端的量化投资操作系统，通过 AI Agent 实现自然语言操作股票分析、量化回测、组合管理等功能。

## 📚 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS
- Monorepo (pnpm + Turborepo)
- AkShare (A股数据)
- IndexedDB (本地存储)

## 🛠️ 开发状态

### Phase 1: 基础框架搭建中...

- [x] 克隆 OpenRoom 项目
- [ ] 定制金融主题 UI
- [ ] 搭建数据层
- [ ] 开发核心应用

## 📁 项目结构

```
quant-terminal/
├── apps/webuiapps/       # 主桌面应用
│   └── src/
│       ├── pages/        # 各种应用
│       │   ├── Dashboard/   # 行情看板
│       │   ├── StockPicker/ # 选股器
│       │   ├── Portfolio/   # 组合管理
│       │   └── ...
│       ├── components/   # 共享组件
│       └── lib/         # 核心 SDK
└── packages/
    └── vibe-container/  # iframe 通信
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发
pnpm dev
```

## 📱 规划中的应用

| 应用 | 功能 |
|------|------|
| Dashboard | 实时行情、资产概览 |
| StockPicker | 条件选股、财务筛选 |
| Portfolio | 持仓管理、风险分析 |
| Backtest | 策略回测 |
| News | 舆情监控 |
| Screener | 板块监控 |

---

*Powered by AI + Quant*
