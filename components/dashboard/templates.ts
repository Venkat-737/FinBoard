import { WidgetConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const TEMPLATES: Record<string, WidgetConfig[]> = {
    'crypto': [
        // TOP ROW: Key Metrics (3 Cards, 4 cols each = 12 total)
        {
            id: 'template-btc-card',
            type: 'CARD',
            title: 'BITCOIN (BTC)',
            apiConfig: {
                endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
                adapterId: 'generic',
                pollingInterval: 120
            },
            dataMap: {
                primary: 'bitcoin.usd',
                delta: 'bitcoin.usd_24h_change',
                subtitle: 'USD'
            },
            layout: { i: 'template-btc-card', x: 0, y: 0, w: 4, h: 2 }
        },
        {
            id: 'template-eth-card',
            type: 'CARD',
            title: 'ETHEREUM (ETH)',
            apiConfig: {
                endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
                adapterId: 'generic',
                pollingInterval: 120
            },
            dataMap: {
                primary: 'ethereum.usd',
                delta: 'ethereum.usd_24h_change',
                subtitle: 'USD'
            },
            layout: { i: 'template-eth-card', x: 4, y: 0, w: 4, h: 3 }
        },
        {
            id: 'template-sol-card',
            type: 'CARD',
            title: 'SOLANA (SOL)',
            apiConfig: {
                endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
                adapterId: 'generic',
                pollingInterval: 120
            },
            dataMap: {
                primary: 'solana.usd',
                delta: 'solana.usd_24h_change',
                subtitle: 'USD'
            },
            layout: { i: 'template-sol-card', x: 8, y: 0, w: 4, h: 3 }
        },

        // BOTTOM ROW: Two Charts Side-by-Side (6 cols each)
        {
            id: 'template-btc-chart',
            type: 'CHART',
            title: 'BITCOIN (BTC) TREND',
            apiConfig: {
                endpoint: 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
                adapterId: 'generic',
                pollingInterval: 120
            },
            dataMap: {
                primary: 'prices',
                xField: '0',
                yField: '1'
            },
            layout: { i: 'template-btc-chart', x: 0, y: 3, w: 6, h: 6 }
        },
        {
            id: 'template-eth-chart',
            type: 'CHART',
            title: 'ETHEREUM (ETH) TREND',
            apiConfig: {
                endpoint: 'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily',
                adapterId: 'generic',
                pollingInterval: 120
            },
            dataMap: {
                primary: 'prices',
                xField: '0',
                yField: '1'
            },
            layout: { i: 'template-eth-chart', x: 6, y: 3, w: 6, h: 6 }
        }
    ],
    'stocks': [
        // TOP ROW: Main Equity Chart (Full Width, Centered)
        {
            id: 'template-ibm-chart',
            type: 'CHART',
            title: 'IBM Equity Trend',
            apiConfig: {
                endpoint: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=DEMO_KEY',
                adapterId: 'alpha_vantage',
                pollingInterval: 300
            },
            dataMap: {
                primary: 'Time Series (Daily)',
                yField: '4. close'
            },
            layout: { i: 'template-ibm-chart', x: 0, y: 0, w: 12, h: 6 }
        },
        {
            id: 'template-ibm-quote',
            type: 'CARD',
            title: 'IBM (Global Quote)',
            apiConfig: {
                endpoint: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=DEMO_KEY',
                adapterId: 'alpha_vantage',
                pollingInterval: 60
            },
            dataMap: {
                primary: 'Global Quote.05. price',
                delta: 'Global Quote.10. change percent',
                subtitle: 'USD'
            },
            layout: { i: 'template-ibm-quote', x: 0, y: 6, w: 6, h: 3 }
        },
        {
            id: 'template-ibm-table',
            type: 'TABLE',
            title: 'IBM History Snippet',
            apiConfig: {
                endpoint: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=DEMO_KEY',
                adapterId: 'alpha_vantage',
                pollingInterval: 300
            },
            dataMap: {
                primary: 'Time Series (Daily)',
                tableColumns: [
                    { header: 'Date', key: 'ROOT_KEY' },
                    { header: 'Close', key: '4. close' }
                ]
            },
            layout: { i: 'template-ibm-table', x: 6, y: 6, w: 6, h: 7 }
        }
    ]
};

export const getTemplate = (key: string): WidgetConfig[] => {
    const template = TEMPLATES[key];
    if (!template) return [];

    return template.map(w => ({
        ...w,
        id: uuidv4(),
        layout: { ...w.layout, i: uuidv4() }
    })).map(w => {
        const newId = uuidv4();
        return {
            ...w,
            id: newId,
            layout: { ...w.layout, i: newId }
        };
    });
};
