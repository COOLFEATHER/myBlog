---
id: 3
title: "Node.js 文件上传实战：从零构建完整的文件处理系统"
date: 2024-03-08
category: "后端开发"
tags: ["Node.js", "JavaScript"]
summary: "本文手把手教你使用 Node.js + Multer 构建企业级文件上传服务，支持大文件分片上传、断点续传和文件管理。"
cover: ""
readCount: 89
likeCount: 32
collectCount: 15
---
## 项目初始化

```bash
npm init -y
npm install express multer express-async-handler cors
```

## 基础文件上传

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename });
});
```

## 分片上传实现

大文件上传采用分片策略：
1. 前端将文件切分为固定大小的块
2. 逐个上传每个分片
3. 服务端记录分片信息
4. 前端发送合并指令后，服务端按顺序合并

## 安全注意事项

- 限制文件类型和大小
- 使用 `uuid` 重命名避免文件名冲突
- 添加文件病毒扫描
- 敏感目录禁止直接访问