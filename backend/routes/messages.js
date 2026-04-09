/**
 * routes/messages.js - 留言接口
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '../../data');

function readData(f) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')); }
function writeData(f, data) { fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(data, null, 2), 'utf-8'); }

// GET /api/messages
router.get('/', (req, res) => {
  try {
    const data = readData('messages.json');
    res.json(data.messages || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/messages - 提交留言
router.post('/', (req, res) => {
  try {
    const { nickname, email, content } = req.body;
    
    // 验证昵称
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ error: '昵称不能为空' });
    }
    if (nickname.length > 10) {
      return res.status(400).json({ error: '昵称不能超过10个字符' });
    }
    
    // 验证邮箱格式
    if (!email || !email.trim()) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '请输入正确的邮箱地址' });
    }
    
    // 验证内容
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '留言内容不能为空' });
    }
    
    const data = readData('messages.json');
    const msgs = data.messages || [];
    const newMsg = { 
      id: msgs.length ? Math.max(...msgs.map(m => m.id)) + 1 : 1, 
      nickname: nickname.trim(), 
      email: email.trim(), 
      content: content.trim(), 
      createTime: new Date().toISOString() 
    };
    msgs.unshift(newMsg);
    writeData('messages.json', { messages: msgs });
    res.json(newMsg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/messages/:id
router.delete('/:id', (req, res) => {
  try {
    const data = readData('messages.json');
    data.messages = (data.messages || []).filter(m => m.id !== parseInt(req.params.id));
    writeData('messages.json', data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
