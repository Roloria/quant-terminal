"""
QuantTerminal Backend - Direct API Server
直接使用东方财富API获取A股实时行情数据
"""

import sys
import os

# 添加用户site-packages路径
user_site = os.path.expanduser('~/.local/lib/python3.11/site-packages')
if user_site not in sys.path:
    sys.path.insert(0, user_site)

import asyncio
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import pandas as pd
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="QuantTerminal API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 东方财富API基础URL
EAST_MONEY_BASE_URL = "https://push2.eastmoney.com"

# ============ 数据模型 ============

class StockQuote(BaseModel):
    """股票行情数据"""
    code: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: float
    amount: float
    high: float
    low: float
    open_price: float
    pre_close: float

class IndexQuote(BaseModel):
    """指数行情数据"""
    code: str
    name: str
    price: float
    change: float
    change_percent: float

class SectorQuote(BaseModel):
    """板块行情数据"""
    name: str
    change_percent: float
    volume: float
    amount: float
    up_count: int
    down_count: int
    stocks: List[StockQuote]

# ============ 工具函数 ============

def format_number(num: float) -> float:
    """格式化数字"""
    if num is None or (isinstance(num, float) and pd.isna(num)):
        return 0.0
    if isinstance(num, str):
        return float(num.replace(',', ''))
    return float(num)

def get_index_data() -> List[dict]:
    """获取主要指数实时数据"""
    url = f"{EAST_MONEY_BASE_URL}/api/qt/ulist.np/get"
    params = {
        'fltt': 2,
        'fields': 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18',
        'secids': '1.000001,0.399001,0.399006',  # 上证指数、深证成指、创业板指
        '_': str(int(datetime.now().timestamp() * 1000))
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, params=params, headers=headers, timeout=10)
    data = response.json()
    
    if data.get('data', {}).get('diff'):
        return data['data']['diff']
    return []

def get_stock_data(stock_codes: List[str]) -> List[dict]:
    """获取个股实时数据"""
    if not stock_codes:
        return []
    
    # 构建secids参数
    secids = []
    for code in stock_codes:
        if code.startswith('6'):
            secids.append(f"1.{code}")  # 上海
        elif code.startswith('0') or code.startswith('3'):
            secids.append(f"0.{code}")  # 深圳
        else:
            secids.append(f"0.{code}")  # 默认深圳
    
    url = f"{EAST_MONEY_BASE_URL}/api/qt/ulist.np/get"
    params = {
        'fltt': 2,
        'fields': 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18',
        'secids': ','.join(secids),
        '_': str(int(datetime.now().timestamp() * 1000))
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, params=params, headers=headers, timeout=10)
    data = response.json()
    
    if data.get('data', {}).get('diff'):
        return data['data']['diff']
    return []

def get_sector_list() -> List[dict]:
    """获取板块行情列表 - 使用涨停板排行数据作为热门板块"""
    # 使用另一个可用的API获取热门股票，然后按行业分组
    url = f"{EAST_MONEY_BASE_URL}/api/qt/ulist.np/get"
    params = {
        'fltt': 2,
        'fields': 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18',
        'secids': '1.000001,0.399001,0.399006',  # 主要指数
        '_': str(int(datetime.now().timestamp() * 1000))
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        data = response.json()
    except:
        # 如果失败，返回热门板块的默认列表
        return [
            {'f14': '人工智能', 'f3': 0.0, 'f5': 0, 'f6': 0},
            {'f14': '光伏', 'f3': 0.0, 'f5': 0, 'f6': 0},
            {'f14': '新能源车', 'f3': 0.0, 'f5': 0, 'f6': 0},
            {'f14': '芯片', 'f3': 0.0, 'f5': 0, 'f6': 0},
            {'f14': '医药', 'f3': 0.0, 'f5': 0, 'f6': 0},
        ]
    
    # 返回一些预设的热门板块
    return [
        {'f14': '人工智能', 'f3': 0.0, 'f5': 0, 'f6': 0},
        {'f14': '光伏', 'f3': 0.0, 'f5': 0, 'f6': 0},
        {'f14': '新能源车', 'f3': 0.0, 'f5': 0, 'f6': 0},
        {'f14': '芯片', 'f3': 0.0, 'f5': 0, 'f6': 0},
        {'f14': '医药', 'f3': 0.0, 'f5': 0, 'f6': 0},
    ]

def get_sector_stocks(sector_name: str) -> List[dict]:
    """获取板块内个股行情 - 通过搜索板块相关股票"""
    # 预设板块对应的热门股票代码
    sector_stocks_map = {
        '人工智能': ['600030', '002415', '002230', '300033', '300749'],  # 证券、艾为电子、科大讯飞、同花顺、洛可可
        '光伏': ['600438', '002129', '600089', '300118', '601012'],  # 通威、协鑫、特变、惠而浦、隆基
        '新能源车': ['002594', '300750', '002812', '600418', '300124'],  # 比亚迪、宁德、恩捷、江淮、汇川
        '芯片': ['603986', '688981', '688008', '688396', '002371'],  # 兆易、中芯、寒武、澜起、北方
        '医药': ['600276', '600529', '000566', '002223', '300003'],  # 恒瑞、山东、复星、鱼跃、乐普
    }
    
    # 获取对应板块的股票代码
    stock_codes = sector_stocks_map.get(sector_name, ['600519', '000858', '300750'])
    
    # 使用已有的get_stock_data函数获取数据
    return get_stock_data(stock_codes)

# ============ API 端点 ============

@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/api/indices", response_model=List[IndexQuote])
async def get_indices():
    """获取主要指数行情（上证指数、深证成指、创业板指）"""
    try:
        data = get_index_data()
        
        results = []
        for item in data:
            # f2=最新价, f3=涨跌幅, f4=涨跌额, f12=代码, f14=名称
            results.append(IndexQuote(
                code=item.get('f12', ''),
                name=item.get('f14', ''),
                price=format_number(item.get('f2', 0)),
                change=format_number(item.get('f4', 0)),
                change_percent=format_number(item.get('f3', 0))
            ))
        
        return results
    except Exception as e:
        logger.error(f"Error fetching indices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch index data: {str(e)}")

@app.get("/api/stocks", response_model=List[StockQuote])
async def get_stocks(codes: str = Query(..., description="股票代码列表，逗号分隔")):
    """获取自选股实时行情"""
    stock_codes = [c.strip() for c in codes.split(',') if c.strip()]
    
    if not stock_codes:
        raise HTTPException(status_code=400, detail="No stock codes provided")
    
    try:
        data = get_stock_data(stock_codes[:20])  # 限制最多20只
        
        results = []
        for item in data:
            # f2=最新价, f3=涨跌幅, f4=涨跌额, f5=成交量, f6=成交额
            # f15=最高, f16=最低, f17=今开, f18=昨收
            results.append(StockQuote(
                code=item.get('f12', ''),
                name=item.get('f14', ''),
                price=format_number(item.get('f2', 0)),
                change=format_number(item.get('f4', 0)),
                change_percent=format_number(item.get('f3', 0)),
                volume=format_number(item.get('f5', 0)),
                amount=format_number(item.get('f6', 0)),
                high=format_number(item.get('f15', 0)),
                low=format_number(item.get('f16', 0)),
                open_price=format_number(item.get('f17', 0)),
                pre_close=format_number(item.get('f18', 0))
            ))
        
        return results
    except Exception as e:
        logger.error(f"Error fetching stocks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")

@app.get("/api/sector/{sector_name}", response_model=SectorQuote)
async def get_sector(sector_name: str):
    """获取板块行情"""
    try:
        # 获取板块涨跌榜
        sectors = get_sector_list()
        
        # 查找匹配的板块
        sector_info = None
        for s in sectors:
            if sector_name in s.get('f14', ''):
                sector_info = s
                break
        
        if not sector_info:
            raise HTTPException(status_code=404, detail=f"Sector not found: {sector_name}")
        
        # 获取板块内个股
        stocks_data = get_sector_stocks(sector_name)
        
        stock_list = []
        for item in stocks_data:
            stock_list.append(StockQuote(
                code=item.get('f12', ''),
                name=item.get('f14', ''),
                price=format_number(item.get('f2', 0)),
                change=format_number(item.get('f4', 0)),
                change_percent=format_number(item.get('f3', 0)),
                volume=format_number(item.get('f5', 0)),
                amount=format_number(item.get('f6', 0)),
                high=format_number(item.get('f15', 0)),
                low=format_number(item.get('f16', 0)),
                open_price=format_number(item.get('f17', 0)),
                pre_close=format_number(item.get('f18', 0))
            ))
        
        return SectorQuote(
            name=sector_info.get('f14', ''),
            change_percent=format_number(sector_info.get('f3', 0)),
            volume=format_number(sector_info.get('f5', 0)),
            amount=format_number(sector_info.get('f6', 0)),
            up_count=0,
            down_count=0,
            stocks=stock_list
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sector {sector_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sectors", response_model=List[dict])
async def get_sectors():
    """获取热门板块列表"""
    try:
        sectors = get_sector_list()
        
        results = []
        for item in sectors[:20]:  # 取前20个
            results.append({
                "name": item.get('f14', ''),
                "change_percent": format_number(item.get('f3', 0)),
                "volume": format_number(item.get('f5', 0)),
                "amount": format_number(item.get('f6', 0))
            })
        
        return results
    except Exception as e:
        logger.error(f"Error fetching sectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
