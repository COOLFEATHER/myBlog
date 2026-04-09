/**
 * routes/articles.js - 文章接口（MD 文件存储）
 * 文章内容存储为 Markdown 文件，元数据存储在索引文件中
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 目录配置
const ARTICLES_DIR = path.join(__dirname, '../../articles');
const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'articles-index.json');

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取索引文件
function readIndex() {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify({ articles: [] }, null, 2), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
}

// 写入索引文件
function writeIndex(data) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 生成 slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')  // 移除特殊字符，保留中文
    .replace(/\s+/g, '-')                    // 空格变连字符
    .replace(/-+/g, '-')                    // 多个连字符合并
    .slice(0, 50);                          // 限制长度
}

// 保存 MD 文件
function saveMdFile(id, title, content) {
  ensureDir(ARTICLES_DIR);
  const slug = slugify(title);
  const filename = `${id}-${slug}.md`;
  const filepath = path.join(ARTICLES_DIR, filename);
  
  // 构建带 frontmatter 的 MD 文件
  const frontmatter = [
    '---',
    `id: ${id}`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${new Date().toISOString().split('T')[0]}`,
    '---',
    ''
  ].join('\n');
  
  fs.writeFileSync(filepath, frontmatter + content, 'utf-8');
  return filename;
}

// 读取 MD 文件
function readMdFile(filename) {
  const filepath = path.join(ARTICLES_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // 解析 frontmatter
  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3);
    if (endIndex !== -1) {
      return {
        frontmatter: content.slice(3, endIndex).trim(),
        body: content.slice(endIndex + 3).trim()
      };
    }
  }
  
  return { frontmatter: '', body: content };
}

// 删除 MD 文件
function deleteMdFile(filename) {
  const filepath = path.join(ARTICLES_DIR, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

// 从索引更新统计信息
function updateArticleStats(id, field, increment = 1) {
  const data = readIndex();
  const article = data.articles.find(a => a.id === parseInt(id));
  if (article) {
    article[field] = (article[field] || 0) + increment;
    writeIndex(data);
    return article[field];
  }
  return null;
}

// ==================== API 接口 ====================

// GET /api/articles - 获取文章列表
router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 10, sortBy = 'latest', category, tag } = req.query;
    const data = readIndex();
    let list = [...(data.articles || [])];

    // 筛选
    if (category) list = list.filter(a => a.category === category);
    if (tag) list = list.filter(a => a.tags && a.tags.includes(tag));

    // 排序
    if (sortBy === 'readCount') {
      list.sort((a, b) => b.readCount - a.readCount);
    } else {
      list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }

    // 移除 content 字段，列表不需要正文
    list = list.map(a => ({ ...a, content: undefined }));

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

// GET /api/articles/:id - 获取单篇文章详情
router.get('/:id(\\d+)', (req, res) => {
  try {
    const data = readIndex();
    const articles = data.articles || [];
    const article = articles.find(a => a.id === parseInt(req.params.id));
    
    if (!article) return res.status(404).json({ error: '文章不存在' });

    // 读取 MD 文件内容
    const mdData = readMdFile(article.filename);
    if (!mdData) return res.status(404).json({ error: '文章文件不存在' });

    // 获取上下篇文章
    const sortedByTime = [...articles].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const currentIndex = sortedByTime.findIndex(a => a.id === article.id);
    const prevArticle = currentIndex < sortedByTime.length - 1 ? sortedByTime[currentIndex + 1] : null;
    const nextArticle = currentIndex > 0 ? sortedByTime[currentIndex - 1] : null;

    res.json({
      ...article,
      content: mdData.body,
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
    const count = updateArticleStats(req.params.id, 'readCount');
    if (count === null) return res.status(404).json({ error: '文章不存在' });
    res.json({ readCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/like/:id - 更新点赞数
router.post('/like/:id', (req, res) => {
  try {
    const count = updateArticleStats(req.params.id, 'likeCount');
    if (count === null) return res.status(404).json({ error: '文章不存在' });
    res.json({ likeCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles/collect/:id - 更新收藏数
router.post('/collect/:id', (req, res) => {
  try {
    const count = updateArticleStats(req.params.id, 'collectCount');
    if (count === null) return res.status(404).json({ error: '文章不存在' });
    res.json({ collectCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles - 新增文章
router.post('/', (req, res) => {
  try {
    const { title, summary, content, category, tags, cover } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: '标题、内容、分类不能为空' });
    }

    const data = readIndex();
    const maxId = Math.max(0, ...(data.articles || []).map(a => a.id));
    const now = new Date().toISOString().split('T')[0];

    // 保存 MD 文件
    const filename = saveMdFile(maxId + 1, title, content);

    // 创建索引条目
    const newArticle = {
      id: maxId + 1,
      title,
      summary: summary || content.slice(0, 100).replace(/[#*`\[\]]/g, '') + '...',
      content, // 保留供搜索等用途
      category,
      tags: tags || [],
      cover: cover || '',
      filename,
      createTime: now,
      updateTime: now,
      readCount: 0,
      likeCount: 0,
      collectCount: 0
    };

    data.articles = data.articles || [];
    data.articles.unshift(newArticle);
    writeIndex(data);

    res.json({ ...newArticle, content: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/articles/:id - 更新文章
router.put('/:id', (req, res) => {
  try {
    const data = readIndex();
    const idx = (data.articles || []).findIndex(a => a.id === parseInt(req.params.id));
    
    if (idx === -1) return res.status(404).json({ error: '文章不存在' });

    const { title, summary, content, category, tags, cover } = req.body;
    const article = data.articles[idx];

    // 更新 MD 文件
    if (content) {
      const filename = saveMdFile(article.id, title || article.title, content);
      article.filename = filename;
    }

    // 更新索引
    article.title = title || article.title;
    article.summary = summary !== undefined ? summary : article.summary;
    if (content) article.content = content;
    article.category = category || article.category;
    article.tags = tags !== undefined ? tags : article.tags;
    article.cover = cover !== undefined ? cover : article.cover;
    article.updateTime = new Date().toISOString().split('T')[0];

    writeIndex(data);
    res.json({ ...article, content: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/articles/:id - 删除文章
router.delete('/:id', (req, res) => {
  try {
    const data = readIndex();
    const idx = (data.articles || []).findIndex(a => a.id === parseInt(req.params.id));
    
    if (idx === -1) return res.status(404).json({ error: '文章不存在' });

    const article = data.articles[idx];

    // 删除 MD 文件
    if (article.filename) {
      deleteMdFile(article.filename);
    }

    // 从索引移除
    data.articles.splice(idx, 1);
    writeIndex(data);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/export/:id - 导出文章为 MD 文件下载
router.get('/export/:id', (req, res) => {
  try {
    const data = readIndex();
    const article = data.articles.find(a => a.id === parseInt(req.params.id));
    
    if (!article) return res.status(404).json({ error: '文章不存在' });

    const mdData = readMdFile(article.filename);
    const filename = `${article.id}-${slugify(article.title)}.md`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(mdData.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
