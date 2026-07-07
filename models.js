document.addEventListener('DOMContentLoaded', () => {
    const modelBtns = document.querySelectorAll('.model-select-btn');
    const modelTitle = document.getElementById('selected-model-title');
    const modelDesc = document.getElementById('selected-model-desc');
    const runModelBtn = document.getElementById('run-model-btn');
    const modelResults = document.getElementById('model-results');
    const epochsSlider = document.getElementById('epochs-slider');
    const epochsVal = document.getElementById('epochs-val');
    const modelTarget = document.getElementById('model-target');
    
    let forecastChart;

    const modelInfo = {
        lstm: {
            title: 'LSTM Neural Net',
            desc: 'LSTM (Long Short-Term Memory) is highly effective at capturing long-term dependencies in sequential data like crypto stock prices, identifying patterns that most traditional models miss.'
        },
        arima: {
            title: 'ARIMA Model',
            desc: 'AutoRegressive Integrated Moving Average is a classic statistical model that uses past values and moving averages to predict short-term trends very reliably in low-volatility markets.'
        },
        prophet: {
            title: 'Facebook Prophet',
            desc: 'Developed by Meta, Prophet decomposes time-series into trend, seasonality, and holiday effects. Excellent at structural breaks in Bitcoin cycles.'
        },
        xgboost: {
            title: 'XGBoost Regressor',
            desc: 'An extreme gradient boosting algorithm. It builds an ensemble of decision trees to capture complex non-linear relationships in the market.'
        }
    };

    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let m = btn.getAttribute('data-model');
            modelTitle.innerText = modelInfo[m].title;
            modelDesc.innerText = modelInfo[m].desc;
            modelResults.style.display = 'none'; // hide previous results
        });
    });

    epochsSlider.addEventListener('input', (e) => {
        epochsVal.innerText = e.target.value;
    });

    runModelBtn.addEventListener('click', () => {
        runModelBtn.classList.add('loading');
        runModelBtn.innerHTML = '<i class="fa-solid fa-circle-notch"></i> Training Model...';
        
        setTimeout(() => {
            runModelBtn.classList.remove('loading');
            runModelBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run Model Now';
            modelResults.style.display = 'block';
            
            // Randomly generate target price
            const currentPrice = 64500; // Mock current price
            const boost = 1 + ((Math.random() - 0.4) * 0.1); // -4% to +6%
            const target = currentPrice * boost * 83.5; // conversion
            modelTarget.innerText = '₹' + target.toLocaleString('en-IN', {maximumFractionDigits:2});
            if(boost >= 1) {
                modelTarget.className = 'positive';
            } else {
                modelTarget.className = 'negative';
            }

            renderChart();
        }, 1500); // simulate 1.5s training time
    });

    function renderChart() {
        const ctx = document.getElementById('modelForecastChart').getContext('2d');
        
        if (forecastChart) forecastChart.destroy();

        // mock data
        const historical = [61000, 62500, 61800, 63000, 64500].map(val => val * 83.5);
        const forecast = [null, null, null, null, 64500, 65200, 64800, 66000, 67200, 68000].map(val => val ? val * 83.5 : null);
        const labels = ['Day -4', 'Day -3', 'Day -2', 'Day -1', 'Today', 'Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5'];

        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Historical',
                        data: historical,
                        borderColor: '#94a3b8',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Forecast',
                        data: forecast,
                        borderColor: '#10b981',
                        borderWidth: 3,
                        pointBackgroundColor: '#10b981',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#0f172a' } }
                },
                scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.05)' } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' } }
                }
            }
        });
    }
});
