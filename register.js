document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证密码
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致，请重试！');
            return;
        }
        
        // 获取现有用户
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 检查用户名是否已存在
        if (users.some(user => user.username === username)) {
            alert('用户名已存在，请选择其他用户名！');
            return;
        }
        
        // 添加新用户
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('注册成功！请返回登录页面登录。');
        window.location.href = 'login.html';
    });
}); 