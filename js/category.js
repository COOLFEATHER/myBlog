/**
 * category.js - 分类页 JavaScript
 * 多级树形分类列表，点击展开显示子分类和文章
 */

;((d, w) => {
  'use strict';

  const CONFIG = {
    apiBase: '/api'
  };

  let state = {
    categories: [],
    articles: {},
    expandedCategories: new Set()
  };

  const elements = {
    categoryTree: d.querySelector('#categoryTree')
  };

  // 获取所有分类
  async function fetchCategories() {
    const res = await fetch(`${CONFIG.apiBase}/categories`);
    if (!res.ok) throw new Error('获取分类失败');
    return res.json();
  }

  // 获取所有文章（不分页）
  async function fetchAllArticles() {
    const res = await fetch(`${CONFIG.apiBase}/articles?pageSize=1000`);
    if (!res.ok) throw new Error('获取文章失败');
    const data = await res.json();
    return data.articles || [];
  }

  // 按分类名称分组文章
  function groupArticlesByCategory(articles) {
    const grouped = {};
    articles.forEach(article => {
      const cat = article.category || '未分类';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(article);
    });
    return grouped;
  }

  // 获取顶级分类（parentId 为 0 或 null）
  function getRootCategories() {
    return state.categories.filter(c => !c.parentId || c.parentId === 0);
  }

  // 获取子分类
  function getChildCategories(parentId) {
    return state.categories.filter(c => c.parentId === parentId);
  }

  // 获取分类下的所有直接文章
  function getArticlesByCategory(categoryName) {
    return state.articles[categoryName] || [];
  }

  // 渲染分类图标
  function renderCategoryIcon(category) {
    const icon = category.icon || 'ri-folder-line';
    const color = category.color || 'var(--color-primary)';
    return `<i class="${icon}" style="color: ${color}"></i>`;
  }

  // 渲染分类头部的子分类列表
  function renderChildCategories(category) {
    const children = getChildCategories(category.id);
    if (children.length === 0) return '';

    const childrenHtml = children.map(child => {
      const childArticles = getArticlesByCategory(child.name);
      const isExpanded = state.expandedCategories.has(child.name);
      const hasGrandChildren = getChildCategories(child.id).length > 0;
      
      return `
        <div class="tree-category-item ${isExpanded ? 'expanded' : ''}" data-category="${child.name}">
          <div class="tree-category-header" onclick="toggleCategory('${child.name}')">
            <div class="tree-category-left">
              ${renderCategoryIcon(child)}
              <span class="tree-category-name">${child.name}</span>
              <span class="tree-category-count">${childArticles.length} 篇</span>
            </div>
            <div class="tree-category-right">
              ${hasGrandChildren ? `<i class="ri-arrow-${isExpanded ? 'up' : 'down'}-s-line tree-arrow"></i>` : ''}
            </div>
          </div>
          <div class="tree-category-content ${isExpanded ? 'show' : ''}">
            ${renderChildCategories(child)}
            ${renderArticleList(child.name)}
          </div>
        </div>
      `;
    }).join('');

    return `<div class="tree-child-categories">${childrenHtml}</div>`;
  }

  // 渲染文章列表
  function renderArticleList(categoryName) {
    const articles = getArticlesByCategory(categoryName);
    if (articles.length === 0) {
      return `<div class="tree-empty">该分类下暂无文章</div>`;
    }

    return articles.map(article => `
      <a href="article.html?id=${article.id}" class="tree-article-item">
        <i class="ri-article-line"></i>
        <span class="tree-article-title">${article.title}</span>
        <span class="tree-article-date">${Utils.formatDate(article.createTime)}</span>
        <span class="tree-article-views"><i class="ri-eye-line"></i> ${article.views || 0}</span>
      </a>
    `).join('');
  }

  // 渲染顶级分类卡片
  function renderRootCategoryCard(category) {
    const articles = getArticlesByCategory(category.name);
    const isExpanded = state.expandedCategories.has(category.name);
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;

    return `
      <div class="tree-item ${isExpanded ? 'expanded' : ''}" data-category="${category.name}">
        <div class="tree-header" onclick="toggleCategory('${category.name}')">
          <div class="tree-header-left">
            <i class="${category.icon || 'ri-folder-line'} tree-icon" style="color: ${category.color || 'var(--color-primary)'}"></i>
            <span class="tree-name">${category.name}</span>
            <span class="tree-count">${articles.length} 篇文章</span>
          </div>
          <div class="tree-header-right">
            ${category.description ? `<span class="tree-badge">${category.description}</span>` : ''}
            <i class="ri-arrow-${isExpanded ? 'up' : 'down'}-s-line tree-arrow"></i>
          </div>
        </div>
        <div class="tree-content ${isExpanded ? 'show' : ''}">
          ${hasChildren ? renderChildCategories(category) : ''}
          ${renderArticleList(category.name)}
        </div>
      </div>
    `;
  }

  // 渲染整个分类树
  function renderCategoryTree() {
    if (!elements.categoryTree) return;

    if (state.categories.length === 0) {
      elements.categoryTree.innerHTML = `
        <div class="empty-state">
          <i class="ri-folder-line"></i>
          <p>暂无分类</p>
        </div>
      `;
      return;
    }

    const rootCategories = getRootCategories();
    if (rootCategories.length === 0) {
      elements.categoryTree.innerHTML = `
        <div class="empty-state">
          <i class="ri-folder-line"></i>
          <p>暂无分类</p>
        </div>
      `;
      return;
    }

    const html = rootCategories.map(cat => renderRootCategoryCard(cat)).join('');
    elements.categoryTree.innerHTML = html;
  }

  // 切换分类展开/收起
  w.toggleCategory = function(categoryName) {
    if (state.expandedCategories.has(categoryName)) {
      state.expandedCategories.delete(categoryName);
    } else {
      state.expandedCategories.add(categoryName);
    }
    renderCategoryTree();
  };

  // 加载数据
  async function loadData() {
    try {
      elements.categoryTree.innerHTML = `
        <div class="article-skeleton"></div>
        <div class="article-skeleton"></div>
        <div class="article-skeleton"></div>
      `;

      const [categories, articles] = await Promise.all([
        fetchCategories(),
        fetchAllArticles()
      ]);

      // 确保 categories 是数组
      state.categories = Array.isArray(categories) ? categories : [];
      state.articles = groupArticlesByCategory(articles);

      renderCategoryTree();

    } catch (error) {
      console.error('加载数据失败:', error);
      if (elements.categoryTree) {
        elements.categoryTree.innerHTML = `
          <div class="empty-state">
            <i class="ri-error-warning-line"></i>
            <p>数据加载失败，请刷新重试</p>
          </div>
        `;
      }
    }
  }

  // 初始化
  function init() {
    loadData();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
