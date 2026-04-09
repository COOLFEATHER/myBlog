/**
 * app.js - OVERRAIN 博客后端服务
 * 基于 Express.js 提供 RESTful API
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - CORS 配置（允许多个域名）
app.use(cors({
  origin: [
    'https://myblog-qcy9.onrender.com',
    /\.vercel\.app$/,  // 允许所有 Vercel 子域名
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== 登录接口（简单 Token 验证） ====================
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    res.json({ token, username });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

// ==================== 挂载路由 ====================
const articlesRouter = require('./routes/articles');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const projectsRouter = require('./routes/projects');
const messagesRouter = require('./routes/messages');

app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/messages', messagesRouter);

// ==================== 前台静态文件 ====================
app.use(express.static(path.join(__dirname, '../')));

// ==================== 管理后台静态文件 ====================
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ==================== 健康检查 ====================
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ==================== 启动服务 ====================
app.listen(PORT, () => {
  console.log(`\n  OVERRAIN Blog Server`);
  console.log(`  http://localhost:${PORT}\n`);
});
