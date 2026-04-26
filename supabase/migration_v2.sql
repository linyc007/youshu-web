-- 1. 为现有表增加币种支持
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'CNY' NOT NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'CNY' NOT NULL;

-- 2. 创建股票交易表
CREATE TABLE IF NOT EXISTS public.stock_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,        -- 股票代码/名称
    trade_type VARCHAR(10) NOT NULL,    -- BUY 或 SELL
    quantity DECIMAL(12, 4) NOT NULL,   -- 数量
    price DECIMAL(12, 2) NOT NULL,      -- 单价
    currency VARCHAR(10) DEFAULT 'CNY' NOT NULL,
    trade_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 开启 RLS 权限
ALTER TABLE public.stock_trades ENABLE ROW LEVEL SECURITY;

-- 4. 配置 RLS 策略
CREATE POLICY "Users can view their own trades" ON public.stock_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own trades" ON public.stock_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON public.stock_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trades" ON public.stock_trades FOR DELETE USING (auth.uid() = user_id);
