/**
 * routes/tags.js - 标签接口
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '../../data');

function readData(f) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); }
function writeData(f, data) { fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(data, null, 2), 'utf-8'); }

// GET /api/tags - 获取标签列表（带文章数量）
router.get('/', (req, res) => {
  try {
    const tagsData = readData('tags.json');
    const articlesData = readData('articles.json');
    const tags = tagsData.tags || [];
    const articles = articlesData.articles || [];
    
    // 统计每个标签下的文章数量
    const result = tags.map(tag => ({
      ...tag,
      articleCount: articles.filter(a => a.tags && a.tags.includes(tag.name)).length
    }));
    
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tags - 新增标签
router.post('/', (req, res) => {
  try {
    const { name, slug, color } = req.body;
    if (!name) return res.status(400).json({ error: '标签名称不能为空' });
    const data = readData('tags.json');
    const tags = data.tags || [];
    if (tags.find(t => t.slug === slug || t.name === name)) return res.status(400).json({ error: '标签已存在' });
    const newTag = { id: tags.length ? Math.max(...tags.map(t => t.id)) + 1 : 1, name, slug: slug || name, color: color || '#40C4FF' };
    tags.push(newTag);
    writeData('tags.json', { tags });
    res.json(newTag);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/tags/:id
router.put('/:id', (req, res) => {
  try {
    const data = readData('tags.json');
    const idx = (data.tags || []).findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '标签不存在' });
    Object.assign(data.tags[idx], req.body);
    writeData('tags.json', data);
    res.json(data.tags[idx]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/tags/:id
router.delete('/:id', (req, res) => {
  try {
    const data = readData('tags.json');
    data.tags = (data.tags || []).filter(t => t.id !== parseInt(req.params.id));
    writeData('tags.json', data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
