const http = require('http');
const fs = require('fs');
const path = require('path');

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

// 创建请求处理函数
const requestHandler = (req, res) => {
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
          if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
          }
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

// 如果是在 Vercel 环境中，导出处理函数
if (process.env.VERCEL) {
  module.exports = (req, res) => requestHandler(req, res);
} else {
  // 本地开发环境
  const server = http.createServer(requestHandler);
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
