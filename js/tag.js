/**
 * tag.js - 标签页 JavaScript
 */

;((d, w) => {
  'use strict';

  const CONFIG = {
    pageSize: 6,
    apiBase: API_CONFIG.apiBase
  };

  let state = {
    tagName: '',
    articles: [],
    currentPage: 1,
    sortBy: 'latest',
    totalPages: 1
  };

  const elements = {
    articlesGrid: d.querySelector('#articlesGrid'),
    pagination: d.querySelector('#pagination'),
    sortSelect: d.querySelector('#sortSelect'),
    pageTitle: d.querySelector('#pageTitle'),
    pageCount: d.querySelector('#pageCount'),
    categoryList: d.querySelector('#categoryList'),
    tagCloud: d.querySelector('#tagCloud'),
    hotArticles: d.querySelector('#hotArticles')
  };

  async function fetchArticlesByTag(tag, page = 1, sortBy = 'latest') {
    const params = new URLSearchParams({
      page,
      pageSize: CONFIG.pageSize,
      sort: sortBy,
      tag: encodeURIComponent(tag)
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

  function renderArticles(articles) {
    if (!elements.articlesGrid) return;
    
    if (!articles || articles.length === 0) {
      elements.articlesGrid.innerHTML = `
        <div class="empty-state">
          <i class="ri-file-text-line"></i>
          <p>该标签下暂无文章</p>
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
      <a href="tag.html?name=${encodeURIComponent(tag.name)}" class="tag-item ${tag.name === state.tagName ? 'active' : ''}">${tag.name}</a>
    `).join('');
    
    elements.tagCloud.innerHTML = html;
  }

  function renderHotArticles(articles) {
    if (!elements.hotArticles) return;
    
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

  async function loadArticles() {
    try {
      if (elements.articlesGrid) {
        elements.articlesGrid.innerHTML = `
          <div class="article-skeleton"></div>
          <div class="article-skeleton"></div>
          <div class="article-skeleton"></div>
        `;
      }
      
      const data = await fetchArticlesByTag(state.tagName, state.currentPage, state.sortBy);
      state.articles = data.articles || [];
      state.totalPages = data.totalPages || 1;
      
      if (elements.pageCount) {
        elements.pageCount.textContent = `共 ${data.total || 0} 篇文章`;
      }
      
      renderArticles(state.articles);
      renderPagination(state.currentPage, state.totalPages);
      
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
    }
  }

  async function loadSidebarData() {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchCategories(),
        fetchTags()
      ]);
      
      renderCategories(categoriesData.categories || []);
      renderTagCloud(tagsData.tags || []);
    } catch (error) {
      console.error('加载侧边栏数据失败:', error);
    }
  }

  function bindEvents() {
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        loadArticles();
      });
    }
  }

  async function init() {
    state.tagName = Utils.getUrlParam('name');
    
    if (!state.tagName) {
      if (elements.pageTitle) {
        elements.pageTitle.textContent = '标签';
      }
      return;
    }

    if (elements.pageTitle) {
      elements.pageTitle.textContent = `标签：${state.tagName}`;
    }
    
    document.title = `${state.tagName} - OVERRAIN`;

    await loadSidebarData();
    await loadArticles();
    bindEvents();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
