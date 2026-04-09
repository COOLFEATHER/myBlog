/* ============================================
  OVERRAIN 博客后台管理 - 全局 JS
  ============================================ */

const Auth = {
  TOKEN_KEY: 'overrain_admin_token',
  get() { return localStorage.getItem(this.TOKEN_KEY); },
  set(token) { localStorage.setItem(this.TOKEN_KEY, token); },
  clear() { localStorage.removeItem(this.TOKEN_KEY); },
  check() { return !!this.get(); }
};

function showToast(msg, type = 'success') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

async function doLogin(username, password) {
  const data = await api('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  Auth.set(data.token);
  localStorage.setItem('overrain_admin_user', data.username);
  return data;
}

function doLogout() {
  Auth.clear();
  localStorage.removeItem('overrain_admin_user');
  location.href = 'login.html';
}

function requireAuth() {
  if (!Auth.check()) {
    location.href = 'login.html';
  }
}

function formatDate(str) {
  if (!str) return '-';
  return str.replace('T', ' ').slice(0, 16);
}

function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

function renderPagination(container, page, totalPages, onPage) {
  container.innerHTML = '';
  if (totalPages <= 1) return;
  const prev = document.createElement('button');
  prev.textContent = '上一页';
  prev.disabled = page <= 1;
  prev.onclick = () => onPage(page - 1);
  container.appendChild(prev);
  const maxBtns = 5;
  let start = Math.max(1, page - Math.floor(maxBtns / 2));
  let end = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);
  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === page ? 'active' : '';
    btn.onclick = () => onPage(i);
    container.appendChild(btn);
  }
  const next = document.createElement('button');
  next.textContent = '下一页';
  next.disabled = page >= totalPages;
  next.onclick = () => onPage(page + 1);
  container.appendChild(next);
}

function confirmDelete(name) {
  return confirm(`确定要删除"${name}"吗？此操作不可恢复。`);
}

const TAG_COLORS = ['#165DFF', '#40C4FF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#EB0AA4', '#0FC6C2'];
