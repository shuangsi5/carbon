const http = require('http');
const fs = require('fs');
const path = require('path');

// 定义MIME类型
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 创建服务器
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 处理根路径请求
  let filePath = req.url === '/' ? './index.html' : '.' + req.url;
  
  // 获取文件扩展名
  const extname = path.extname(filePath);
  let contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在
        fs.readFile('./404.html', (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`服务器错误: ${err.code}`);
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 设置端口
const PORT = process.env.PORT || 3000;

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`您可以通过以下方式访问：`);
  console.log(`1. 本地访问: http://localhost:${PORT}`);
  console.log(`2. 局域网访问: http://[您的IP地址]:${PORT}`);
  console.log(`3. 如果配置了域名，可以通过域名访问`);
}); 