document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }
    
    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // 简单的用户验证（实际应用中应使用后端验证）
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 登录成功
            localStorage.setItem('currentUser', username);
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        } else {
            alert('用户名或密码错误，请重试！');
        }
    });
    
    // 注册链接点击
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'register.html';
    });
}); 