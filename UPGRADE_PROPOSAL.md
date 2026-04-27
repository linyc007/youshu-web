# 有数 (Youshu) 功能升级与架构设计方案

## 1. 饮食与消费模块功能评估 (Product Manager Perspective)

### 1.1 核心想法评估
**想法**：“增加日常购物小票扫描，记录购物明细和饮食结构模块”。

### 1.2 多维度建议
*   **用户价值与定位匹配度**：
    *   **定位风险**：当前“有数”核心定位是“资产管理”（固定资产、股票等长效资产）。日常消费（小票）属于“损耗性支出”，饮食结构属于“健康管理”。
    *   **匹配点**：若遵循“万物资产化”逻辑，可以将身体健康视为“核心资产”，食物为“投入维护费”。但对于大多数用户，这会显著增加记账负担，可能导致产品从“资产管家”降级为“琐碎记账簿”。
    *   **结论**：**短期内不建议集成在主 App 核心流中**。

*   **实现难度**：
    *   **OCR 识别**：难点在于不同商超小票格式各异，需接入高性能 OCR API (如腾讯云/百度 OCR)，且需复杂的后处理逻辑。
    *   **明细分类**：需要一个庞大的 SKU 数据库或 NLP 聚类算法来将“金龙鱼调和油”归类为“油脂类”。
    *   **饮食习惯分析**：涉及营养学逻辑，开发成本较高。

*   **产品路线建议**：
    *   **建议方案**：作为**独立实验性插件或次级模块**（如“生活实验室”）。
    *   **逻辑调整**：不应仅是记账，而应突出“资产”属性，例如：统计家庭中高价值消耗品的消耗速度，作为资产预测的一部分。

---

## 2. 股票模块增强设计 (Architect Perspective)

### 2.1 业务需求分析
*   **持仓成本**：计算加权平均成本。
*   **累计盈亏**：包含已实现盈亏（卖出部分）和浮动盈亏（持有部分）。
*   **实时市值**：依赖最新价。

### 2.2 数据库与逻辑设计建议

#### A. 数据库表结构调整
现有 `stock_trades` 仅记录交易流水。为了提高查询效率并支持多维统计，建议增加一个**持仓快照视图**或**汇总表**。

```sql
-- 建议增加字段或创建视图来辅助计算
ALTER TABLE public.stock_trades ADD COLUMN IF NOT EXISTS fee DECIMAL(12, 2) DEFAULT 0; -- 手续费影响成本

-- 方案：创建一个实时持仓汇总视图
CREATE OR REPLACE VIEW public.v_stock_holdings AS
WITH summary AS (
    SELECT 
        user_id,
        symbol,
        SUM(CASE WHEN trade_type = 'BUY' THEN quantity ELSE -quantity END) as current_quantity,
        SUM(CASE WHEN trade_type = 'BUY' THEN quantity * price + fee ELSE 0 END) as total_buy_cost,
        SUM(CASE WHEN trade_type = 'BUY' THEN quantity ELSE 0 END) as total_buy_quantity,
        SUM(CASE WHEN trade_type = 'SELL' THEN quantity * price - fee ELSE 0 END) as total_sell_proceeds,
        SUM(CASE WHEN trade_type = 'SELL' THEN quantity ELSE 0 END) as total_sell_quantity
    FROM public.stock_trades
    GROUP BY user_id, symbol
)
SELECT 
    *,
    -- 加权平均成本 (仅参考买入价格)
    CASE WHEN total_buy_quantity > 0 THEN total_buy_cost / total_buy_quantity ELSE 0 END as avg_buy_price,
    -- 已实现盈亏 = (卖出价 - 对应比例的买入成本) - 卖出手续费
    (total_sell_proceeds - (CASE WHEN total_buy_quantity > 0 THEN (total_buy_cost / total_buy_quantity) * total_sell_quantity ELSE 0 END)) as realized_pnl
FROM summary
WHERE current_quantity > 0;
```

#### B. 最新价获取策略
1.  **手动输入**：在持仓列表页提供一个“批量更新现价”的入口，作为兜底。
2.  **API 接入**：
    *   **国内股/港美股**：建议使用 `yfinance` (Python) 或 `yahoo-finance2` (Node.js) 的轻量级封装。
    *   **架构设计**：在 Next.js Edge Function 或 API Route 中创建一个 `/api/stocks/quote?symbols=AAPL,600519` 接口。
    *   **缓存机制**：前端使用 SWR 或 React Query，后端使用 Redis/Supabase Cache 缓存 5-15 分钟，避免频繁调用。

#### C. 代码逻辑调整
*   **Store 层**：增加 `useStockStore`，统一管理持仓、最新价及盈亏计算逻辑。
*   **UI 层**：
    *   **持仓列表**：增加“成本价”、“现价”、“浮动盈亏（%）”、“累计实现盈亏”字段。
    *   **可视化**：使用 Recharts 展示股票资产占比饼图。

---

## 3. 下一步行动计划
1.  确认股票统计逻辑（是否采用加权平均成本法）。
2.  实现 `v_stock_holdings` 视图或在前端计算逻辑。
3.  开发简单的小程序端或 Web 端“现价输入”对话框。
4.  (可选) 调研饮食模块的 OCR SDK，仅作为“资产消耗”的可选记录。
