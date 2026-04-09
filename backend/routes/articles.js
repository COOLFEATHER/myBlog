/**
 * routes/articles.js - 文章接口
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');

function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/articles - 获取文章列表（支持分页、筛选、排序）
router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 5, sortBy = 'latest', category, tag } = req.query;
    const data = readData('articles.json');
    let list = [...(data.articles || [])];

    if (category) list = list.filter(a => a.category === category);
    if (tag) list = list.filter(a => a.tags && a.tags.includes(tag));

    if (sortBy === 'readCount') {
      list.sort((a, b) => b.readCount - a.readCount);
    } else {
      list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }

    const total = list.length;
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const start = (p - 1) * ps;
    const items = list.slice(start, start + ps);

    res.json({ articles: items, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/:id - 获取单篇文章详情（包含上一篇、下一篇）
router.get('/:id(\\d+)', (req, res) => {
  try {
    const data = readData('articles.json');
    const articles = data.articles || [];
    const article = articles.find(a => a.id === parseInt(req.params.id));
    if (!article) return res.status(404).json({ error: '文章不存在' });
    
    // 获取当前文章在排序后的位置
    const sortedByTime = [...articles].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const currentIndex = sortedByTime.findIndex(a => a.id === article.id);
    
    // 获取上一篇和下一篇
    const prevArticle = currentIndex < sortedByTime.length - 1 ? sortedByTime[currentIndex + 1] : null;
    const nextArticle = currentIndex > 0 ? sortedByTime[currentIndex - 1] : null;
    
    res.json({
      ...article,
      prevArticle: prevArticle ? { id: prevArticle.id, title: prevArticle.title } : null,
      nextArticle: nextArticle ? { id: nextArticle.id, title: nextArticle.title } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/read/:id - 更新阅读量
router.post('/read/:id', (req, res) => {
  try {
    const data = readData('articles.json');
    const article = (data.articles || []).find(a => a.id === parseInt(req.params.id));
    if (!article) return res.status(404).json({ error: '文章不存在' });
    article.readCount = (article.readCount || 0) + 1;
    writeData('articles.json', data);
    res.json({ readCount: article.readCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/like/:id - 更新点赞数
router.post('/like/:id', (req, res) => {
  try {
    const data = readData('articles.json');
    const article = (data.articles || []).find(a => a.id === parseInt(req.params.id));
    if (!article) return res.status(404).json({ error: '文章不存在' });
    article.likeCount = (article.likeCount || 0) + 1;
    writeData('articles.json', data);
    res.json({ likeCount: article.likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/collect/:id - 更新收藏数
router.post('/collect/:id', (req, res) => {
  try {
    const data = readData('articles.json');
    const article = (data.articles || []).find(a => a.id === parseInt(req.params.id));
    if (!article) return res.status(404).json({ error: '文章不存在' });
    article.collectCount = (article.collectCount || 0) + 1;
    writeData('articles.json', data);
    res.json({ collectCount: article.collectCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles - 新增文章
router.post('/', (req, res) => {
  try {
    const { title, summary, content, category, tags, cover } = req.body;
    if (!title || !content || !category) return res.status(400).json({ error: '标题、内容、分类不能为空' });
    const data = readData('articles.json');
    const maxId = Math.max(0, ...(data.articles || []).map(a => a.id));
    const now = new Date().toISOString().split('T')[0];
    const newArticle = { id: maxId + 1, title, summary: summary || '', content, category, tags: tags || [], cover: cover || '', createTime: now, updateTime: now, readCount: 0, likeCount: 0, collectCount: 0 };
    data.articles = data.articles || [];
    data.articles.unshift(newArticle);
    writeData('articles.json', data);
    res.json(newArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/articles/:id - 更新文章
router.put('/:id', (req, res) => {
  try {
    const data = readData('articles.json');
    const idx = (data.articles || []).findIndex(a => a.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '文章不存在' });
    const { title, summary, content, category, tags, cover } = req.body;
    const article = data.articles[idx];
    article.title = title || article.title;
    article.summary = summary !== undefined ? summary : article.summary;
    article.content = content || article.content;
    article.category = category || article.category;
    article.tags = tags !== undefined ? tags : article.tags;
    article.cover = cover !== undefined ? cover : article.cover;
    article.updateTime = new Date().toISOString().split('T')[0];
    writeData('articles.json', data);
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/articles/:id - 删除文章
router.delete('/:id', (req, res) => {
  try {
    const data = readData('articles.json');
    const idx = (data.articles || []).findIndex(a => a.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '文章不存在' });
    data.articles.splice(idx, 1);
    writeData('articles.json', data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
