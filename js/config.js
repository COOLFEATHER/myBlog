/**
 * config.js - 全局配置
 * API 地址根据部署环境自动选择
 */

// 检测当前环境
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API 基础地址配置
const API_CONFIG = {
  // 本地开发/同源部署（Render）：使用相对路径
  // Vercel 等外部部署：指向 Render API
  apiBase: IS_LOCAL ? '/api' : 'https://myblog-qcy9.onrender.com/api'
};
