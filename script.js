// 碳足迹计算系数（每单位产生的CO2千克数）
const CARBON_FACTORS = {
    car: 0.12,           // 每公里产生的CO2千克数
    publicTransport: 0.04, // 每次公共交通产生的CO2千克数
    electricity: 0.785,   // 每千瓦时产生的CO2千克数
    gas: 2.1,            // 每立方米天然气产生的CO2千克数
    waste: 2.53,         // 每千克垃圾产生的CO2千克数
    water: 0.344         // 每立方米水产生的CO2千克数
};

// 获取DOM元素
const calculateButton = document.getElementById('calculate');
const resultDiv = document.getElementById('result');
const userDisplay = document.getElementById('userDisplay');
const logoutBtn = document.getElementById('logoutBtn');
let carbonChart = null;
let rankingChart = null;

// 检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // 显示当前用户名
    const currentUser = localStorage.getItem('currentUser');
    userDisplay.textContent = `欢迎，${currentUser}`;
    
    // 添加退出登录事件
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // 初始化排名数据（如果不存在）
    if (!localStorage.getItem('carbonRankings')) {
        localStorage.setItem('carbonRankings', JSON.stringify([]));
    }
});

// 添加计算按钮点击事件监听器
calculateButton.addEventListener('click', calculateCarbonFootprint);

function calculateCarbonFootprint() {
    // 获取输入值
    const carDistance = parseFloat(document.getElementById('car').value) || 0;
    const publicTransportTrips = parseFloat(document.getElementById('public').value) || 0;
    const electricityUsage = parseFloat(document.getElementById('electricity').value) || 0;
    const gasUsage = parseFloat(document.getElementById('gas').value) || 0;
    const wasteAmount = parseFloat(document.getElementById('waste').value) || 0;
    const waterUsage = parseFloat(document.getElementById('water').value) || 0;

    // 计算各部分碳足迹
    const transportCarbon = (carDistance * CARBON_FACTORS.car) + 
                          (publicTransportTrips * CARBON_FACTORS.publicTransport);
    
    const energyCarbon = (electricityUsage * CARBON_FACTORS.electricity) + 
                        (gasUsage * CARBON_FACTORS.gas);
    
    const lifestyleCarbon = (wasteAmount * 4 * CARBON_FACTORS.waste) + // 将每周转换为每月
                          (waterUsage * CARBON_FACTORS.water);

    // 计算总碳足迹
    const totalCarbon = transportCarbon + energyCarbon + lifestyleCarbon;

    // 更新结果显示
    document.getElementById('carbonFootprint').textContent = totalCarbon.toFixed(2);
    document.getElementById('transportCarbon').textContent = transportCarbon.toFixed(2);
    document.getElementById('energyCarbon').textContent = energyCarbon.toFixed(2);
    document.getElementById('lifestyleCarbon').textContent = lifestyleCarbon.toFixed(2);

    // 显示结果区域
    resultDiv.style.display = 'block';
    
    // 绘制饼状图
    drawPieChart(transportCarbon, energyCarbon, lifestyleCarbon);
    
    // 更新排名
    updateRanking(totalCarbon);
}

// 绘制饼状图
function drawPieChart(transportCarbon, energyCarbon, lifestyleCarbon) {
    const ctx = document.getElementById('carbonChart').getContext('2d');
    
    // 如果图表已存在，先销毁
    if (carbonChart) {
        carbonChart.destroy();
    }
    
    // 创建新图表
    carbonChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['交通出行', '家庭能源', '日常生活'],
            datasets: [{
                data: [transportCarbon, energyCarbon, lifestyleCarbon],
                backgroundColor: [
                    '#3498db', // 蓝色 - 交通
                    '#e74c3c', // 红色 - 能源
                    '#2ecc71'  // 绿色 - 生活
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw.toFixed(2);
                            return `${context.label}: ${value} 千克CO₂`;
                        }
                    }
                }
            }
        }
    });
}

// 更新排名
function updateRanking(totalCarbon) {
    const currentUser = localStorage.getItem('currentUser');
    const rankings = JSON.parse(localStorage.getItem('carbonRankings') || '[]');
    
    // 查找用户是否已有记录
    const userIndex = rankings.findIndex(item => item.username === currentUser);
    
    if (userIndex !== -1) {
        // 更新现有记录
        rankings[userIndex].carbonFootprint = totalCarbon;
        rankings[userIndex].date = new Date().toISOString();
    } else {
        // 添加新记录
        rankings.push({
            username: currentUser,
            carbonFootprint: totalCarbon,
            date: new Date().toISOString()
        });
    }
    
    // 按碳足迹从低到高排序（低碳足迹排名更高）
    rankings.sort((a, b) => a.carbonFootprint - b.carbonFootprint);
    
    // 保存更新后的排名
    localStorage.setItem('carbonRankings', JSON.stringify(rankings));
    
    // 显示排名信息
    displayRanking(rankings, currentUser);
}

// 显示排名信息
function displayRanking(rankings, currentUser) {
    // 查找当前用户排名
    const userIndex = rankings.findIndex(item => item.username === currentUser);
    const userRank = userIndex !== -1 ? userIndex + 1 : '--';
    const totalUsers = rankings.length;
    
    // 更新排名显示
    document.getElementById('userRank').textContent = userRank;
    document.getElementById('totalUsers').textContent = totalUsers;
    
    // 绘制排名图表
    drawRankingChart(rankings, currentUser);
}

// 绘制排名图表
function drawRankingChart(rankings, currentUser) {
    const ctx = document.getElementById('rankingChart').getContext('2d');
    
    // 如果图表已存在，先销毁
    if (rankingChart) {
        rankingChart.destroy();
    }
    
    // 准备数据
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    // 只显示前10名和当前用户（如果不在前10名）
    const top10 = rankings.slice(0, 10);
    const currentUserRank = rankings.findIndex(item => item.username === currentUser);
    
    // 如果当前用户不在前10名，添加当前用户
    if (currentUserRank >= 10) {
        top10.push(rankings[currentUserRank]);
    }
    
    top10.forEach((item, index) => {
        // 使用用户名或"您"来标识
        const label = item.username === currentUser ? '您' : `用户${index + 1}`;
        labels.push(label);
        data.push(item.carbonFootprint);
        
        // 当前用户使用特殊颜色
        if (item.username === currentUser) {
            backgroundColors.push('#3498db');
        } else {
            backgroundColors.push('#95a5a6');
        }
    });
    
    // 创建新图表
    rankingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '碳足迹 (千克CO₂)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '碳足迹 (千克CO₂)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `碳足迹: ${context.raw.toFixed(2)} 千克CO₂`;
                        }
                    }
                }
            }
        }
    });
}

// 添加输入验证
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
}); 