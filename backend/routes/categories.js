/**
 * routes/categories.js - 分类接口（支持多级父子分类）
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '../../data');

function readData(f) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); }
function writeData(f, data) { fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(data, null, 2), 'utf-8'); }

// GET /api/categories - 获取分类列表（带文章数量）
router.get('/', (req, res) => {
  try {
    const categoriesData = readData('categories.json');
    const articlesData = readData('articles.json');
    const categories = categoriesData.categories || [];
    const articles = articlesData.articles || [];
    
    // 统计每个分类下的文章数量
    const result = categories.map(cat => ({
      ...cat,
      articleCount: articles.filter(a => a.category === cat.name).length
    }));
    
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/categories/tree - 树形结构
router.get('/tree', (req, res) => {
  try {
    const data = readData('categories.json');
    const cats = data.categories || [];
    const roots = cats.filter(c => !c.parentId || c.parentId === 0);
    function buildTree(parent) {
      const children = cats.filter(c => c.parentId === parent.id);
      return { ...parent, children: children.map(buildTree) };
    }
    res.json(roots.map(buildTree));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/categories - 新增分类
router.post('/', (req, res) => {
  try {
    const { name, slug, parentId, icon, description, color } = req.body;
    if (!name) return res.status(400).json({ error: '分类名称不能为空' });
    const data = readData('categories.json');
    const cats = data.categories || [];
    const siblings = cats.filter(c => (c.parentId || 0) === (parentId || 0));
    if (siblings.find(c => c.slug === slug || c.name === name)) return res.status(400).json({ error: '同级分类已存在同名' });
    const newCat = { id: cats.length ? Math.max(...cats.map(c => c.id)) + 1 : 1, name, slug: slug || name, parentId: parentId || 0, articleCount: 0, icon: icon || 'folder', description: description || '', color: color || '#165DFF' };
    cats.push(newCat);
    writeData('categories.json', { categories: cats });
    res.json(newCat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  try {
    const data = readData('categories.json');
    const idx = (data.categories || []).findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '分类不存在' });
    const { name, slug, parentId, icon, description, color } = req.body;
    const cat = data.categories[idx];
    if (name !== undefined) cat.name = name;
    if (slug !== undefined) cat.slug = slug;
    if (parentId !== undefined) cat.parentId = parentId;
    if (icon !== undefined) cat.icon = icon;
    if (description !== undefined) cat.description = description;
    if (color !== undefined) cat.color = color;
    writeData('categories.json', data);
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/categories/:id/move - 移动分类
router.put('/:id/move', (req, res) => {
  try {
    const data = readData('categories.json');
    const cats = data.categories || [];
    const idx = cats.findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '分类不存在' });
    const { parentId, direction } = req.body;
    const cat = cats[idx];
    if (parentId !== undefined) {
      if (parentId !== 0) {
        function isDescendant(pid, tid) {
          const p = cats.find(c => c.id === pid);
          if (!p) return false;
          if (p.id === tid) return true;
          return (p.parentId || 0) !== 0 && isDescendant(p.parentId, tid);
        }
        if (isDescendant(parentId, cat.id)) return res.status(400).json({ error: '不能将分类移动到自己的子分类下' });
      }
      cat.parentId = parentId;
    }
    if (direction && parentId === undefined) {
      const siblings = cats.filter(c => (c.parentId || 0) === (cat.parentId || 0)).sort((a, b) => a.id - b.id);
      const pos = siblings.findIndex(c => c.id === cat.id);
      if (pos !== -1) {
        const newPos = direction === 'up' ? pos - 1 : pos + 1;
        if (newPos >= 0 && newPos < siblings.length) {
          const other = siblings[newPos];
          const tmpId = cat.id; cat.id = other.id; other.id = tmpId;
        }
      }
    }
    writeData('categories.json', data);
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  try {
    const data = readData('categories.json');
    const cats = data.categories || [];
    const targetId = parseInt(req.params.id);
    function collectDescendants(pid) {
      const children = cats.filter(c => c.parentId === pid);
      const ids = children.map(c => c.id);
      children.forEach(c => { ids.push(...collectDescendants(c.id)); });
      return ids;
    }
    const toDelete = new Set([targetId, ...collectDescendants(targetId)]);
    const remaining = cats.filter(c => !toDelete.has(c.id));
    writeData('categories.json', { categories: remaining });
    res.json({ success: true, deletedCount: toDelete.size });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
