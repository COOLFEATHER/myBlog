/**
 * routes/projects.js - 项目接口
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '../../data');

function readData(f) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); }
function writeData(f, data) { fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(data, null, 2), 'utf-8'); }

// GET /api/projects - 获取项目列表（支持分页）
router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const data = readData('projects.json');
    const list = [...(data.projects || [])].sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    const total = list.length;
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const start = (p - 1) * ps;
    const items = list.slice(start, start + ps);
    
    res.json({ 
      projects: items, 
      total, 
      page: p, 
      pageSize: ps, 
      totalPages: Math.ceil(total / ps) 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/projects - 新增项目
router.post('/', (req, res) => {
  try {
    const { name, description, tech, demo, repo, cover, status } = req.body;
    if (!name) return res.status(400).json({ error: '项目名称不能为空' });
    const data = readData('projects.json');
    const list = data.projects || [];
    const newProj = { id: list.length ? Math.max(...list.map(p => p.id)) + 1 : 1, name, description: description || '', tech: tech || [], demo: demo || '', repo: repo || '', cover: cover || '', status: status || '进行中', createTime: new Date().toISOString().split('T')[0] };
    list.push(newProj);
    writeData('projects.json', { projects: list });
    res.json(newProj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
  try {
    const data = readData('projects.json');
    const idx = (data.projects || []).findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: '项目不存在' });
    Object.assign(data.projects[idx], req.body);
    writeData('projects.json', data);
    res.json(data.projects[idx]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  try {
    const data = readData('projects.json');
    data.projects = (data.projects || []).filter(p => p.id !== parseInt(req.params.id));
    writeData('projects.json', data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
