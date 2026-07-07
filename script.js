// DOM Elements
const priceEl = document.getElementById('current-price');
const changeEl = document.getElementById('price-change');
const predPriceEl = document.getElementById('predicted-price');
const confScoreEl = document.getElementById('confidence-score');
const trendEl = document.getElementById('trend-sentiment');
const volatEl = document.getElementById('volatility');
const rsiEl = document.getElementById('rsi-val');
const ctx = document.getElementById('btcChart').getContext('2d');
const predictBtn = document.getElementById('run-prediction-btn');
const timeBtns = document.querySelectorAll('.timeframe-selector button');
const predictDaysEl = document.getElementById('predict-days');
const predictionTitleEl = document.getElementById('prediction-title');

let btcChart;
let currentPriceValue = 0;
let historicalPrices = [];
let chartLabels = [];
let ws;

// Init Chart.js Global Defaults
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = 'Inter';

// Handle User Authentication State
const userName = localStorage.getItem('user_name');
const userProfileContainer = document.querySelector('.user-profile');
if (userName && userProfileContainer) {
    userProfileContainer.innerHTML = `
        <div class="user-info" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="font-weight: 600; font-size: 0.9rem;">${userName}</span>
            <img src="https://ui-avatars.com/api/?name=${userName}&background=6366f1&color=fff" alt="${userName}" style="border-radius: 50%; width: 40px; height: 40px; border: 2px solid var(--border-color);">
            <a href="#" id="logout-btn" style="color: var(--negative); font-size: 0.8rem; margin-left: 10px; text-decoration: none;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user_name');
        window.location.reload();
    });
}

// Connect to Binance WebSocket for Real-time Price
function initWebSocket() {
    ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const usdToInrRate = 83.5; // conversion rate placeholder
        const price = parseFloat(data.c) * usdToInrRate;
        const change = parseFloat(data.p) * usdToInrRate;
        const percentChange = parseFloat(data.P);
        
        currentPriceValue = price;

        // Update UI
        priceEl.innerText = `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        if (change >= 0) {
            changeEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> +₹${change.toFixed(2)} (+${percentChange.toFixed(2)}%)`;
            changeEl.className = 'change positive';
        } else {
            changeEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> -₹${Math.abs(change).toFixed(2)} (${percentChange.toFixed(2)}%)`;
            changeEl.className = 'change negative';
        }

        // Randomly update volatility and RSI to make dashboard look "live"
        if(Math.random() > 0.8) {
            volatEl.innerText = (2.1 + (Math.random() * 0.5)).toFixed(2) + '%';
            rsiEl.innerText = (45 + (Math.random() * 20)).toFixed(1);
        }
    };

    ws.onerror = (err) => {
        console.error('WebSocket Error', err);
        priceEl.innerText = "Connection Error";
    };
}

// Fetch Historical Data for Chart
async function fetchHistoricalData(timeframe = '30d') {
    let limit, interval;
    switch(timeframe) {
        case '24h': interval = '1h'; limit = 24; break;
        case '7d': interval = '4h'; limit = 42; break;
        case '30d': default: interval = '1d'; limit = 30; break;
    }

    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`);
        const data = await response.json();
        
        historicalPrices = [];
        chartLabels = [];
        
        data.forEach(candle => {
            const time = new Date(candle[0]);
            let timeStr = '';
            if(timeframe === '24h' || timeframe === '7d') {
                timeStr = time.getHours() + ':00';
            } else {
                timeStr = time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
            
            chartLabels.push(timeStr);
            const usdToInrRate = 83.5;
            historicalPrices.push(parseFloat(candle[4]) * usdToInrRate); // Closing price in INR
        });

        updateChart();
    } catch (err) {
        console.error("Failed to fetch history", err);
    }
}

// Initialize and Update Chart
function updateChart() {
    if(btcChart) {
        btcChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    btcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'BTC/USDT',
                data: historicalPrices,
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4 // smoothness
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0f172a',
                    bodyColor: '#0f172a',
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                    ticks: {
                        callback: function(value) { return '₹' + value.toLocaleString('en-IN'); }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Prediction Logic (Simulated AI)
function runPrediction() {
    if(currentPriceValue === 0) return;

    const days = parseInt(predictDaysEl.value) || 1;
    predictionTitleEl.innerHTML = `Next ${days} Day${days > 1 ? 's' : ''} Prediction <i class="fa-solid fa-wand-magic-sparkles highlight-icon"></i>`;

    predictBtn.classList.add('loading');
    predictBtn.innerHTML = '<i class="fa-solid fa-circle-notch"></i> Analyzing Models...';
    predPriceEl.innerText = "Processing...";
    predPriceEl.className = "gradient-text";
    confScoreEl.innerText = "--%";
    trendEl.innerText = "--";

    // Simulate API delay
    setTimeout(() => {
        // Simple mock prediction based on recent trend vector
        const p1 = historicalPrices[0];
        const pn = historicalPrices[historicalPrices.length - 1];
        const trend = (pn - p1) / p1; 
        
        // Add some random noise and momentum
        const noise = (Math.random() - 0.5) * 0.04; // base noise
        
        // Scale prediction based on time horizon
        const daysMultiplier = Math.sqrt(days);
        const predictedChange = ((trend * 0.3) + noise + 0.005) * daysMultiplier; 
        
        const nextPrice = currentPriceValue * (1 + predictedChange);
        
        // Confidence drops slightly as prediction horizon increases
        const confidenceDrop = days * 0.4;
        const confidence = Math.max(10, (60 + Math.random() * 32) - confidenceDrop).toFixed(1);
        
        // Update UI
        predPriceEl.innerText = '₹' + nextPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        confScoreEl.innerText = confidence + '%';

        if(predictedChange >= 0) {
            trendEl.innerText = "Bullish";
            trendEl.className = "positive";
            predPriceEl.style.background = "linear-gradient(135deg, #10b981, #3b82f6)";
        } else {
            trendEl.innerText = "Bearish";
            trendEl.className = "negative";
            predPriceEl.style.background = "linear-gradient(135deg, #ef4444, #f59e0b)";
        }
        predPriceEl.style.webkitBackgroundClip = "text";
        predPriceEl.style.webkitTextFillColor = "transparent";

        predictBtn.classList.remove('loading');
        predictBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Run Deep Analysis';
        
    }, 2000); // 2 second mock delay
}

// Event Listeners
timeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        timeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        fetchHistoricalData(e.target.getAttribute('data-tf'));
    });
});

predictBtn.addEventListener('click', runPrediction);

// Initialize App
initWebSocket();
fetchHistoricalData('30d');
