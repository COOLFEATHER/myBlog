// js/api.js - 全局 API 请求封装
const API_BASE = API_CONFIG ? API_CONFIG.apiBase : '/api';

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetch(API_BASE + url, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}
