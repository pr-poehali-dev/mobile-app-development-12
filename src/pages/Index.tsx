import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { id: "chart", label: "График", icon: "LineChart" },
  { id: "trades", label: "Сделки", icon: "ArrowLeftRight" },
  { id: "positions", label: "Позиции", icon: "Layers" },
  { id: "settings", label: "Настройки", icon: "Settings2" },
];

const generateCandles = (count: number) => {
  let price = 95000;
  return Array.from({ length: count }, (_, i) => {
    const change = (Math.random() - 0.48) * 800;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 300;
    const low = Math.min(open, close) - Math.random() * 300;
    price = close;
    return { open, close, high, low, time: i };
  });
};

const generateTrades = () => [
  { id: 1, pair: "BTC/USDT", type: "BUY", entry: 94200.5, exit: 95840.2, pnl: 1639.7, pnlPct: 1.74, time: "14:32", date: "20.03", status: "closed", volume: 0.1 },
  { id: 2, pair: "ETH/USDT", type: "SELL", entry: 3480.0, exit: 3310.5, pnl: 169.5, pnlPct: 4.87, time: "11:15", date: "20.03", status: "closed", volume: 1.5 },
  { id: 3, pair: "BTC/USDT", type: "BUY", entry: 93100.0, exit: 92450.0, pnl: -650.0, pnlPct: -0.70, time: "09:44", date: "20.03", status: "closed", volume: 0.1 },
  { id: 4, pair: "SOL/USDT", type: "BUY", entry: 178.4, exit: 182.9, pnl: 4.5, pnlPct: 2.52, time: "22:10", date: "19.03", status: "closed", volume: 10 },
  { id: 5, pair: "BNB/USDT", type: "SELL", entry: 598.0, exit: 612.5, pnl: -14.5, pnlPct: -2.42, time: "18:33", date: "19.03", status: "closed", volume: 2 },
  { id: 6, pair: "BTC/USDT", type: "BUY", entry: 91500.0, exit: 94200.0, pnl: 2700.0, pnlPct: 2.95, time: "13:05", date: "19.03", status: "closed", volume: 0.1 },
  { id: 7, pair: "ETH/USDT", type: "BUY", entry: 3200.0, exit: 3480.0, pnl: 280.0, pnlPct: 8.75, time: "07:22", date: "18.03", status: "closed", volume: 1.0 },
  { id: 8, pair: "SOL/USDT", type: "SELL", entry: 185.0, exit: 178.4, pnl: 66.0, pnlPct: 3.57, time: "15:48", date: "17.03", status: "closed", volume: 10 },
];

const positions = [
  { id: 1, pair: "BTC/USDT", type: "LONG", entry: 94500.0, current: 95840.2, pnl: 1340.2, pnlPct: 1.42, volume: 0.05, leverage: "5x", time: "2ч 14м" },
  { id: 2, pair: "ETH/USDT", type: "SHORT", entry: 3520.0, current: 3498.5, pnl: 21.5, pnlPct: 0.61, volume: 0.8, leverage: "3x", time: "45м" },
];

const equityData = [18200, 19100, 18400, 19800, 21200, 20100, 22400, 23800, 22900, 24500, 25100, 26800, 25400, 27200, 28900, 27500, 29800, 31200, 30100, 32400];

function EquityChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 800, h = 120;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 100 }}>
      <defs>
        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(158 80% 48%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(158 80% 48%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#equityGrad)" />
      <polyline points={points} fill="none" stroke="hsl(158 80% 48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CandleChart({ candles }: { candles: ReturnType<typeof generateCandles> }) {
  const prices = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const w = 900, h = 300;
  const candleW = (w / candles.length) * 0.6;
  const gap = w / candles.length;
  const toY = (p: number) => ((maxP - p) / range) * h;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      {Array.from({ length: 5 }, (_, i) => {
        const val = minP + (range / 4) * i;
        return <line key={i} x1={0} y1={toY(val)} x2={w} y2={toY(val)} stroke="hsl(220 15% 16%)" strokeWidth="1" strokeDasharray="4,4" />;
      })}
      {candles.map((c, i) => {
        const x = i * gap + gap / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? "hsl(158 80% 48%)" : "hsl(0 75% 55%)";
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
        return (
          <g key={i}>
            <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="1" />
            <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${active ? "bg-profit/10 text-profit" : "bg-muted text-muted-foreground"}`}>
      <span className={`w-2 h-2 rounded-full ${active ? "bg-profit animate-pulse-slow" : "bg-muted-foreground"}`} />
      {active ? "Активен" : "Остановлен"}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color, delay = 0 }: {
  label: string; value: string; sub?: string; icon: string; color: string; delay?: number;
}) {
  return (
    <div className="card-glass p-4 flex flex-col gap-2 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
          <Icon name={icon} fallback="CircleAlert" size={16} className={color} />
        </div>
      </div>
      <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRunning, setIsRunning] = useState(true);
  const [candles] = useState(() => generateCandles(60));
  const [trades] = useState(generateTrades);
  const [currentPrice, setCurrentPrice] = useState(95840.2);
  const [timeframe, setTimeframe] = useState("1H");
  const [riskLevel, setRiskLevel] = useState(35);
  const [maxDrawdown, setMaxDrawdown] = useState(10);
  const [positionsLimit, setPositionsLimit] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(p => +(p + (Math.random() - 0.49) * 60).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalPnl = trades.reduce((a, t) => a + t.pnl, 0);
  const winTrades = trades.filter(t => t.pnl > 0);
  const winRate = Math.round((winTrades.length / trades.length) * 100);

  const tickerItems = [
    { pair: "BTC/USDT", price: currentPrice.toFixed(1), change: "+1.74%" },
    { pair: "ETH/USDT", price: "3 498.50", change: "+0.61%" },
    { pair: "SOL/USDT", price: "182.90", change: "+2.52%" },
    { pair: "BNB/USDT", price: "598.20", change: "-1.20%" },
    { pair: "XRP/USDT", price: "0.5842", change: "+0.88%" },
    { pair: "ADA/USDT", price: "0.4521", change: "-0.34%" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-profit/15 flex items-center justify-center border border-profit/20">
              <Icon name="Bot" size={20} className="text-profit" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none">Robot Seller</div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5 font-mono">AI Trading v2.4</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge active={isRunning} />
            <button className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
              <Icon name="Bell" size={15} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t border-border ticker-wrap bg-surface h-7 flex items-center overflow-hidden">
          <div className="ticker-content flex items-center gap-8 px-4 text-xs font-mono">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-muted-foreground">{t.pair}</span>
                <span className="text-foreground font-semibold">{t.price}</span>
                <span className={t.change.startsWith("+") ? "text-profit" : "text-loss"}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin pb-20">

        {/* ───── DASHBOARD ───── */}
        {activeTab === "dashboard" && (
          <div className="p-4 space-y-3">
            {/* Balance */}
            <div className="card-glass p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Баланс портфеля</span>
                <span className="text-xs font-mono text-muted-foreground">USDT</span>
              </div>
              <div className="font-mono text-4xl font-black text-foreground tracking-tight">32 400.00</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-profit text-sm font-semibold font-mono">+14 200.00</span>
                <span className="text-profit text-xs bg-profit/10 px-2 py-0.5 rounded-full font-mono">+78.2%</span>
                <span className="text-xs text-muted-foreground">за всё время</span>
              </div>
              <div className="mt-3">
                <EquityChart data={equityData} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="P&L сегодня" value="+$3 159" sub="5 сделок" icon="TrendingUp" color="text-profit" delay={50} />
              <StatCard label="Винрейт" value={`${winRate}%`} sub={`${winTrades.length}/${trades.length} побед`} icon="Target" color="text-profit" delay={100} />
              <StatCard label="Открытых поз." value="2" sub="активных" icon="Layers" color="text-foreground" delay={150} />
              <StatCard label="Просадка" value="-3.2%" sub="макс. -8.4%" icon="TrendingDown" color="text-loss" delay={200} />
            </div>

            {/* Active Positions */}
            <div className="card-glass p-4 animate-fade-in" style={{ animationDelay: "250ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">Открытые позиции</span>
                <button onClick={() => setActiveTab("positions")} className="text-xs text-profit">Все →</button>
              </div>
              <div className="space-y-2">
                {positions.map(pos => (
                  <div key={pos.id} className="bg-surface-2 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${pos.type === "LONG" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>
                          {pos.type}
                        </span>
                        <span className="font-semibold text-sm">{pos.pair}</span>
                        <span className="text-xs text-muted-foreground font-mono bg-surface px-1.5 py-0.5 rounded">{pos.leverage}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${pos.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        +{pos.pnl.toFixed(2)} $
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div><div className="text-muted-foreground">Вход</div><div className="font-mono font-medium">{pos.entry.toFixed(0)}</div></div>
                      <div><div className="text-muted-foreground">Сейчас</div><div className="font-mono font-medium">{pos.current.toFixed(0)}</div></div>
                      <div><div className="text-muted-foreground">Время</div><div className="font-mono font-medium">{pos.time}</div></div>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className={`h-full rounded-full ${pos.pnl >= 0 ? "bg-profit" : "bg-loss"}`} style={{ width: `${Math.min(pos.pnlPct * 12, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last trades */}
            <div className="card-glass p-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">Последние сделки</span>
                <button onClick={() => setActiveTab("trades")} className="text-xs text-profit">Все →</button>
              </div>
              {trades.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${t.type === "BUY" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>{t.type}</span>
                    <div>
                      <div className="text-sm font-medium">{t.pair}</div>
                      <div className="text-xs text-muted-foreground">{t.date} {t.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)} $
                    </div>
                    <div className={`text-xs font-mono ${t.pnlPct >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───── CHART ───── */}
        {activeTab === "chart" && (
          <div className="p-4 space-y-3">
            <div className="card-glass p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">BTC/USDT · Binance</div>
                  <div className="font-mono text-2xl font-black text-profit">{currentPrice.toFixed(1)}</div>
                </div>
                <div className="flex gap-1.5">
                  {["15M", "1H", "4H", "1D"].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? "bg-profit text-background" : "bg-surface-2 text-muted-foreground"}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-56 w-full overflow-hidden">
                <CandleChart candles={candles} />
              </div>
            </div>

            {/* Indicators */}
            <div className="card-glass p-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="text-sm font-semibold mb-3">Индикаторы модели</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "RSI (14)", value: "64.2", signal: "Нейтрально", color: "text-warning" },
                  { name: "MACD", value: "+124.5", signal: "Покупка", color: "text-profit" },
                  { name: "BB Width", value: "2.4%", signal: "Сжатие", color: "text-warning" },
                  { name: "ATR (14)", value: "1 240", signal: "Высокий", color: "text-loss" },
                  { name: "EMA 20/50", value: "Бычий", signal: "Выше EMA", color: "text-profit" },
                  { name: "Объём", value: "↑ 34%", signal: "Рост", color: "text-profit" },
                ].map((ind, i) => (
                  <div key={i} className="bg-surface-2 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">{ind.name}</div>
                    <div className={`font-mono text-sm font-bold ${ind.color}`}>{ind.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ind.signal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Signal */}
            <div className="card-glass p-4 border border-profit/25 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-profit/20 flex items-center justify-center">
                  <Icon name="Zap" size={14} className="text-profit" />
                </div>
                <span className="text-sm font-semibold">Сигнал нейросети</span>
                <span className="ml-auto text-xs text-muted-foreground">2 мин назад</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Рекомендация</div>
                  <div className="text-profit font-black text-2xl tracking-wide">ПОКУПАТЬ</div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">Уверенность: 78%</div>
                </div>
                <div className="w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="hsl(220 15% 16%)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="30" fill="none"
                      stroke="hsl(158 80% 48%)" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 30 * 0.78} ${2 * Math.PI * 30}`}
                      strokeDashoffset={2 * Math.PI * 30 * 0.25}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                    <text x="40" y="45" textAnchor="middle" style={{ fontSize: 14, fill: "hsl(210 20% 92%)", fontFamily: "JetBrains Mono", fontWeight: 700 }}>78%</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───── TRADES ───── */}
        {activeTab === "trades" && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 animate-fade-in">
              <div className="card-glass p-3 text-center">
                <div className="font-mono text-base font-black text-profit">+${totalPnl.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Итого P&L</div>
              </div>
              <div className="card-glass p-3 text-center">
                <div className="font-mono text-base font-black">{winRate}%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Винрейт</div>
              </div>
              <div className="card-glass p-3 text-center">
                <div className="font-mono text-base font-black">{trades.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Сделок</div>
              </div>
            </div>

            <div className="card-glass p-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
              <div className="text-sm font-semibold mb-2">Кривая капитала</div>
              <EquityChart data={equityData} />
            </div>

            <div className="card-glass overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="p-4 border-b border-border">
                <span className="font-semibold text-sm">История сделок</span>
              </div>
              {trades.map((t, idx) => (
                <div key={t.id} className="p-4 flex items-center gap-3 border-b border-border last:border-0 animate-fade-in" style={{ animationDelay: `${idx * 25}ms` }}>
                  <div className={`w-1 self-stretch rounded-full shrink-0 ${t.pnl >= 0 ? "bg-profit" : "bg-loss"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${t.type === "BUY" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>{t.type}</span>
                      <span className="font-semibold text-sm">{t.pair}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.date} {t.time} · vol {t.volume}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{t.entry.toFixed(1)} → {t.exit.toFixed(1)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold text-sm ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)} $
                    </div>
                    <div className={`text-xs font-mono ${t.pnlPct >= 0 ? "text-profit" : "text-loss"}`}>
                      {t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───── POSITIONS ───── */}
        {activeTab === "positions" && (
          <div className="p-4 space-y-3">
            <div className="card-glass p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Открытые позиции</span>
                <span className="text-xs text-muted-foreground">{positions.length} активных</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Общий P&L</div>
                  <div className="font-mono text-xl font-black text-profit">+$1 361.70</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Задействовано</div>
                  <div className="font-mono text-xl font-black">$4 200</div>
                </div>
              </div>
            </div>

            {positions.map((pos, i) => (
              <div key={pos.id} className="card-glass p-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold px-2.5 py-1 rounded-lg text-sm ${pos.type === "LONG" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>{pos.type}</span>
                    <span className="font-bold">{pos.pair}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-surface-2 px-2 py-0.5 rounded">{pos.leverage}</span>
                  </div>
                  <span className={`font-mono text-lg font-black ${pos.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    +{pos.pnl.toFixed(2)} $
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Цена входа", value: pos.entry.toFixed(2) },
                    { label: "Текущая", value: pos.current.toFixed(2) },
                    { label: "Объём", value: `${pos.volume}` },
                    { label: "Время", value: pos.time },
                  ].map((item, j) => (
                    <div key={j} className="bg-surface-2 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="font-mono text-sm font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Доходность</span>
                    <span className={pos.pnl >= 0 ? "text-profit font-mono" : "text-loss font-mono"}>+{pos.pnlPct.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pos.pnl >= 0 ? "bg-profit" : "bg-loss"}`} style={{ width: `${Math.min(pos.pnlPct * 15, 100)}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-loss/10 text-loss text-sm font-semibold border border-loss/20">
                    Закрыть позицию
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
                    <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}

            <div className="card-glass p-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="text-sm font-semibold mb-3">Параметры работы</div>
              {[
                { label: "Стратегия", value: "Momentum + ML" },
                { label: "Биржа", value: "Binance Futures" },
                { label: "Макс. позиций", value: `${positionsLimit}` },
                { label: "Риск на сделку", value: `${riskLevel}%` },
                { label: "Макс. просадка", value: `${maxDrawdown}%` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───── SETTINGS ───── */}
        {activeTab === "settings" && (
          <div className="p-4 space-y-3">
            {/* Robot control */}
            <div className="card-glass p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">Управление роботом</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Запуск и остановка торговли</div>
                </div>
                <StatusBadge active={isRunning} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRunning(true)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isRunning ? "bg-profit text-background" : "bg-surface-2 text-muted-foreground"}`}
                >
                  <Icon name="Play" size={16} />
                  Запустить
                </button>
                <button
                  onClick={() => setIsRunning(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${!isRunning ? "bg-loss text-white" : "bg-surface-2 text-muted-foreground"}`}
                >
                  <Icon name="Square" size={16} />
                  Остановить
                </button>
              </div>
            </div>

            {/* Risk */}
            <div className="card-glass p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="font-semibold mb-4">Управление рисками</div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Уровень риска</span>
                    <span className="font-mono text-sm font-bold text-warning">{riskLevel}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={riskLevel} onChange={e => setRiskLevel(+e.target.value)}
                    className="w-full h-2 rounded-full cursor-pointer appearance-none"
                    style={{ background: `linear-gradient(to right, hsl(158 80% 48%) ${riskLevel}%, hsl(220 15% 16%) ${riskLevel}%)` }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Консервативный</span><span>Агрессивный</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Макс. просадка</span>
                    <span className="font-mono text-sm font-bold text-loss">{maxDrawdown}%</span>
                  </div>
                  <input type="range" min={2} max={30} value={maxDrawdown} onChange={e => setMaxDrawdown(+e.target.value)}
                    className="w-full h-2 rounded-full cursor-pointer appearance-none"
                    style={{ background: `linear-gradient(to right, hsl(0 75% 55%) ${(maxDrawdown / 30) * 100}%, hsl(220 15% 16%) ${(maxDrawdown / 30) * 100}%)` }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2%</span><span>30%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Позиций одновременно</span>
                    <span className="font-mono text-sm font-bold">{positionsLimit}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => setPositionsLimit(n)}
                        className={`flex-1 py-2 rounded-xl text-sm font-mono font-bold transition-colors ${positionsLimit === n ? "bg-profit text-background" : "bg-surface-2 text-muted-foreground"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy */}
            <div className="card-glass p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="font-semibold mb-4">Параметры стратегии</div>
              <div className="space-y-4">
                {[
                  { label: "Стратегия", options: ["Momentum", "Mean Rev", "Scalping"], current: 0 },
                  { label: "Пары", options: ["BTC+ETH", "Top 5", "Top 10"], current: 0 },
                  { label: "Биржа", options: ["Binance", "Bybit", "OKX"], current: 0 },
                  { label: "Таймфрейм", options: ["15M", "1H", "4H"], current: 1 },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
                    <div className="flex gap-1.5">
                      {s.options.map((opt, j) => (
                        <button key={j} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${j === s.current ? "bg-profit/20 text-profit border border-profit/30" : "bg-surface-2 text-muted-foreground"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="card-glass p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="font-semibold mb-4">Уведомления</div>
              <div className="space-y-3">
                {[
                  { label: "Открытие позиции", on: true },
                  { label: "Закрытие с прибылью", on: true },
                  { label: "Закрытие с убытком", on: true },
                  { label: "Достижение просадки", on: true },
                  { label: "Ежедневный отчёт", on: false },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{n.label}</span>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${n.on ? "bg-profit" : "bg-surface-2"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${n.on ? "left-5" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md z-50">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${active ? "nav-active" : "text-muted-foreground"}`}
              >
                <Icon name={tab.icon} fallback="CircleAlert" size={19} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}