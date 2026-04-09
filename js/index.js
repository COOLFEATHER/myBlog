/**
 * index.js - 首页 JavaScript
 */

;((d, w) => {
  'use strict';

  // ==================== 配置 ====================
  const CONFIG = {
    pageSize: 6,
    apiBase: API_CONFIG.apiBase
  };

  // ==================== 状态 ====================
  let state = {
    articles: [],
    categories: [],
    tags: [],
    currentPage: 1,
    sortBy: 'latest',
    totalPages: 1
  };

  // ==================== 元素引用 ====================
  const elements = {
    articlesGrid: d.querySelector('#articlesGrid'),
    pagination: d.querySelector('#pagination'),
    sortSelect: d.querySelector('#sortSelect'),
    heroTags: d.querySelector('#heroTags'),
    categoryList: d.querySelector('#categoryList'),
    tagCloud: d.querySelector('#tagCloud'),
    hotArticles: d.querySelector('#hotArticles'),
    sidebarToggle: d.querySelector('.sidebar-toggle')
  };

  // ==================== API 请求 ====================
  async function fetchArticles(page = 1, sortBy = 'latest') {
    const params = new URLSearchParams({
      page,
      pageSize: CONFIG.pageSize,
      sort: sortBy
    });
    
    const res = await fetch(`${CONFIG.apiBase}/articles?${params}`);
    if (!res.ok) throw new Error('获取文章失败');
    return res.json();
  }

  async function fetchCategories() {
    const res = await fetch(`${CONFIG.apiBase}/categories`);
    if (!res.ok) throw new Error('获取分类失败');
    return res.json();
  }

  async function fetchTags() {
    const res = await fetch(`${CONFIG.apiBase}/tags`);
    if (!res.ok) throw new Error('获取标签失败');
    return res.json();
  }

  // ==================== 渲染函数 ====================
  function renderArticles(articles) {
    if (!elements.articlesGrid) return;
    
    if (!articles || articles.length === 0) {
      elements.articlesGrid.innerHTML = `
        <div class="empty-state">
          <i class="ri-file-text-line"></i>
          <p>暂无文章</p>
        </div>
      `;
      return;
    }

    const html = articles.map(article => `
      <article class="article-card" data-id="${article.id}">
        <div class="article-card-header">
          <span class="article-category">${article.category}</span>
          <span class="article-date">${Utils.formatDate(article.createTime)}</span>
        </div>
        <h3 class="article-title" onclick="location.href='article.html?id=${article.id}'">
          ${article.title}
        </h3>
        <p class="article-summary">${Utils.truncate(article.summary, 120)}</p>
        <div class="article-tags">
          ${article.tags.map(tag => `<span class="article-tag" onclick="location.href='tag.html?name=${encodeURIComponent(tag)}'">${tag}</span>`).join('')}
        </div>
        <div class="article-meta">
          <span><i class="ri-eye-line"></i> ${article.readCount || 0} 阅读</span>
          <span><i class="ri-heart-line"></i> ${article.likeCount || 0} 点赞</span>
          <span><i class="ri-star-line"></i> ${article.collectCount || 0} 收藏</span>
        </div>
      </article>
    `).join('');

    elements.articlesGrid.innerHTML = html;
  }

  function renderPagination(currentPage, totalPages) {
    if (!elements.pagination) return;
    
    new Pagination({
      container: elements.pagination,
      currentPage,
      totalPages,
      onChange: (page) => {
        state.currentPage = page;
        loadArticles();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function renderHeroTags(tags) {
    if (!elements.heroTags) return;
    
    const html = tags.slice(0, 5).map(tag => `
      <span class="hero-tag">&lt;${tag.name}/&gt;</span>
    `).join('');
    
    elements.heroTags.innerHTML = html;
  }

  function renderCategories(categories) {
    if (!elements.categoryList) return;
    
    const html = categories.map(cat => `
      <a href="category.html?name=${encodeURIComponent(cat.name)}" class="category-item">
        <span>${cat.name}</span>
        <span class="category-count">${cat.articleCount || 0}</span>
      </a>
    `).join('');
    
    elements.categoryList.innerHTML = html;
  }

  function renderTagCloud(tags) {
    if (!elements.tagCloud) return;
    
    const html = tags.map(tag => `
      <a href="tag.html?name=${encodeURIComponent(tag.name)}" class="tag-item">${tag.name}</a>
    `).join('');
    
    elements.tagCloud.innerHTML = html;
  }

  function renderHotArticles(articles) {
    if (!elements.hotArticles) return;
    
    // 取阅读量前5的文章
    const hot = [...articles]
      .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
      .slice(0, 5);
    
    if (hot.length === 0) {
      elements.hotArticles.innerHTML = '<p class="empty-state">暂无热门文章</p>';
      return;
    }
    
    const html = hot.map(article => `
      <a href="article.html?id=${article.id}" class="hot-article-item">
        <div class="hot-article-title">${article.title}</div>
        <div class="hot-article-meta"><i class="ri-eye-line"></i> ${article.readCount || 0}</div>
      </a>
    `).join('');
    
    elements.hotArticles.innerHTML = html;
  }

  // ==================== 加载数据 ====================
  async function loadArticles() {
    try {
      // 显示骨架屏
      if (elements.articlesGrid) {
        elements.articlesGrid.innerHTML = `
          <div class="article-skeleton"></div>
          <div class="article-skeleton"></div>
          <div class="article-skeleton"></div>
        `;
      }
      
      const data = await fetchArticles(state.currentPage, state.sortBy);
      state.articles = data.articles || [];
      state.totalPages = data.totalPages || 1;
      
      renderArticles(state.articles);
      renderPagination(state.currentPage, state.totalPages);
      
      // 更新热门文章
      if (data.articles) {
        renderHotArticles(data.articles);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
      if (elements.articlesGrid) {
        elements.articlesGrid.innerHTML = `
          <div class="empty-state">
            <i class="ri-error-warning-line"></i>
            <p>数据加载失败，请刷新重试</p>
          </div>
        `;
      }
      Toast.error('数据加载失败');
    }
  }

  async function loadSidebarData() {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchCategories(),
        fetchTags()
      ]);
      
      state.categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
      state.tags = Array.isArray(tagsData) ? tagsData : (tagsData.tags || []);
      
      renderCategories(state.categories);
      renderTagCloud(state.tags);
      renderHeroTags(state.tags);
    } catch (error) {
      console.error('加载侧边栏数据失败:', error);
    }
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    // 排序选择
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        loadArticles();
      });
    }

    // 移动端侧边栏切换
    if (elements.sidebarToggle) {
      elements.sidebarToggle.addEventListener('click', () => {
        const sidebar = d.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('mobile-open');
        }
      });
    }
  }

  // ==================== 初始化 ====================
  async function init() {
    await loadSidebarData();
    await loadArticles();
    bindEvents();
  }

  // 页面加载完成后初始化
  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
