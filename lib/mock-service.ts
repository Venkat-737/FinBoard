// Simulate realistic data for demo purposes
// Prevents API rate limits and ensures the UI looks good during testing.

export const MOCK_DATA = {
    // 1. Single Value (Card)
    BITCOIN_PRICE: {
        data: {
            base: "BTC",
            currency: "USD",
            amount: "45230.50",
            change_pct: "2.5"
        }
    },

    // 2. Table Data (Users)
    USERS_LIST: [
        { id: 1, name: "Alice Johnson", role: "Admin", status: "Active" },
        { id: 2, name: "Bob Smith", role: "Trader", status: "Offline" },
        { id: 3, name: "Charlie Brown", role: "Analyst", status: "Active" },
        { id: 4, name: "Diana Prince", role: "Manager", status: "Active" },
        { id: 5, name: "Evan Wright", role: "Trader", status: "Suspended" },
        { id: 6, name: "Fiona Apple", role: "Admin", status: "Active" }
    ],

    // 3. Time Series (Chart)
    STOCK_HISTORY: [
        { date: "2024-01-01", close: 150 },
        { date: "2024-01-02", close: 155 },
        { date: "2024-01-03", close: 153 },
        { date: "2024-01-04", close: 158 },
        { date: "2024-01-05", close: 162 },
        { date: "2024-01-06", close: 160 },
        { date: "2024-01-07", close: 165 },
    ],

    // 4. Finnhub Mock (Candles - Columnar)
    FINNHUB_CANDLES: {
        s: "ok",
        c: [150.5, 152.0, 151.2, 153.8, 155.0, 154.5, 156.0, 158.2, 160.0, 159.5], // Close prices
        t: [1704067200, 1704153600, 1704240000, 1704326400, 1704412800, 1704499200, 1704585600, 1704672000, 1704758400, 1704844800], // Unix Timestamps
        v: [5000, 5200, 4800, 6000, 7000, 6500, 7200, 8000, 8500, 8200]
    },

    // 5. Finnhub Quote (Card)
    FINNHUB_QUOTE: {
        c: 175.50, // Current
        d: 2.35,   // Change
        dp: 1.34,  // Percent
        h: 176.00,
        l: 172.00,
        o: 173.50,
        pc: 173.15
    },

    // 6. Indian Stock API (Card/Table)
    INDIAN_STOCK: {
        companyProfile: {
            symbol: "TCS",
            companyName: "Tata Consultancy Services Ltd.",
            isin: "INE467B01029",
            industry: "IT Services/ Consulting"
        },
        currentPrice: {
            BSE: "3850.45",
            NSE: "3851.00"
        },
        percentChange: "1.25",
        dayHigh: "3890.00",
        dayLow: "3820.00"
    },

    // 7. TCS Mock Candles (Realistic Range ~3800)
    INDIAN_CANDLES: {
        s: "ok",
        c: [3820, 3840, 3810, 3850, 3880, 3865, 3890, 3900, 3880, 3850], // TCS-like prices
        t: [1704067200, 1704153600, 1704240000, 1704326400, 1704412800, 1704499200, 1704585600, 1704672000, 1704758400, 1704844800],
        v: [150000, 120000, 180000, 160000, 200000, 140000, 130000, 190000, 210000, 150000]
    },

    // 8. Alpha Vantage Mock (Time Series Object)
    ALPHA_VANTAGE_SERIES: {
        "Time Series (Daily)": {
            "2024-01-26": { "1. open": "180.50", "2. high": "183.00", "3. low": "179.50", "4. close": "182.00", "5. volume": "5000000" },
            "2024-01-25": { "1. open": "178.00", "2. high": "181.50", "3. low": "177.00", "4. close": "180.20", "5. volume": "4800000" },
            "2024-01-24": { "1. open": "175.50", "2. high": "179.00", "3. low": "175.00", "4. close": "178.10", "5. volume": "5100000" },
            "2024-01-23": { "1. open": "174.00", "2. high": "176.50", "3. low": "173.50", "4. close": "175.00", "5. volume": "4900000" },
            "2024-01-22": { "1. open": "172.50", "2. high": "174.50", "3. low": "172.00", "4. close": "173.80", "5. volume": "4700000" },
            "2024-01-21": { "1. open": "170.00", "2. high": "173.00", "3. low": "169.50", "4. close": "172.00", "5. volume": "4600000" },
            "2024-01-20": { "1. open": "168.00", "2. high": "171.00", "3. low": "167.50", "4. close": "170.50", "5. volume": "4500000" }
        }
    },

    // 9. Alpha Vantage Quote Mock
    ALPHA_VANTAGE_QUOTE: {
        "Global Quote": {
            "01. symbol": "IBM",
            "02. open": "180.00",
            "03. high": "185.00",
            "04. low": "179.00",
            "05. price": "182.50",
            "06. volume": "4500000",
            "07. latest trading day": "2024-01-26",
            "08. previous close": "180.00",
            "09. change": "2.50",
            "10. change percent": "1.38%"
        }
    },

    // 11. CoinGecko Card Mock (Simple Price)
    COINGECKO_CARD: {
        bitcoin: { usd: 85230.50, usd_24h_change: 2.5 },
        ethereum: { usd: 2890.10, usd_24h_change: 1.2 },
        solana: { usd: 125.45, usd_24h_change: -0.8 },
        tether: { usd: 1.00, usd_24h_change: 0.01 },
        binancecoin: { usd: 350.50, usd_24h_change: 0.5 },
        ripple: { usd: 0.55, usd_24h_change: 1.1 }
    },

    // 10. CoinGecko Market Chart Mock (Sparks)
    COINGECKO_SPARK: {
        prices: [
            [1706227200000, 41000],
            [1706313600000, 41500],
            [1706400000000, 41200],
            [1706486400000, 42100],
            [1706572800000, 42800],
            [1706659200000, 43200],
            [1706745600000, 42900],
            [1706832000000, 43500],
            [1706918400000, 44000],
            [1707004800000, 43800]
        ]
    }
};


export const getMockData = (url: string) => {
    const lower = url.toLowerCase();

    // 1. Specific prioritization: Indian + Candle -> distinct dataset
    if (lower.includes('tcs') && lower.includes('candle')) return MOCK_DATA.INDIAN_CANDLES;

    // 2a. CoinGecko Sparklines (Market Chart)
    if (lower.includes('market_chart') && (lower.includes('bitcoin') || lower.includes('ethereum') || lower.includes('solana'))) {
        return MOCK_DATA.COINGECKO_SPARK;
    }
    // 2b. CoinGecko Cards (Simple Price)
    if (lower.includes('simple/price')) {
        return MOCK_DATA.COINGECKO_CARD;
    }

    // 3. Alpha Vantage Mocking
    if (lower.includes('alphavantage') && lower.includes('time_series')) return MOCK_DATA.ALPHA_VANTAGE_SERIES;
    if (lower.includes('alphavantage') && lower.includes('quote')) return MOCK_DATA.ALPHA_VANTAGE_QUOTE;

    // 4. Finnhub Mocking
    if (lower.includes('candle')) return MOCK_DATA.FINNHUB_CANDLES;
    if (lower.includes('quote')) return MOCK_DATA.FINNHUB_QUOTE;

    // 5. Indian API Mocking
    if (lower.includes('indianapi') || lower.includes('tcs')) return MOCK_DATA.INDIAN_STOCK;

    if (lower.includes('bitcoin') || lower.includes('btc')) return MOCK_DATA.BITCOIN_PRICE;
    if (lower.includes('users') || lower.includes('table')) return MOCK_DATA.USERS_LIST;
    if (lower.includes('history') || lower.includes('chart')) return MOCK_DATA.STOCK_HISTORY;

    // Default fallback
    return { message: "Mock Data: No match found for URL", value: 123.45 };
};
