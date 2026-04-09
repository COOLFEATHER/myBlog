/**
 * main.js - 全局 JavaScript
 * 包含主题切换、导航、工具函数等
 */

;((d) => {
  'use strict';

  // ==================== 主题切换 ====================
  const ThemeManager = {
    STORAGE_KEY: 'overrain-theme',
    
    init() {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(theme);
      this.bindEvents();
    },
    
    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.updateToggleBtn(theme);
    },
    
    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    },
    
    updateToggleBtn(theme) {
      const btn = d.querySelector('.theme-toggle');
      if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? '切换到亮色模式' : '切换到暗黑模式';
      }
    },
    
    bindEvents() {
      const btn = d.querySelector('.theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => this.toggle());
      }
    }
  };

  // ==================== 导航栏 ====================
  const Navbar = {
    init() {
      this.navbar = d.querySelector('.navbar');
      this.navToggle = d.querySelector('.nav-toggle');
      this.navLinks = d.querySelector('.nav-links');
      this.sidebarToggle = d.querySelector('.sidebar-toggle');
      
      this.bindScroll();
      this.bindMobileNav();
      this.highlightCurrentNav();
    },
    
    bindScroll() {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
          this.navbar?.classList.add('scrolled');
        } else {
          this.navbar?.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
      });
    },
    
    bindMobileNav() {
      if (this.navToggle && this.navLinks) {
        this.navToggle.addEventListener('click', () => {
          this.navLinks.classList.toggle('active');
          const icon = this.navToggle.querySelector('i');
          if (icon) {
            icon.classList.toggle('ri-menu-line');
            icon.classList.toggle('ri-close-line');
          }
        });
        
        // 点击链接后关闭导航
        this.navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            this.navLinks.classList.remove('active');
            const icon = this.navToggle.querySelector('i');
            if (icon) {
              icon.classList.add('ri-menu-line');
              icon.classList.remove('ri-close-line');
            }
          });
        });
      }
      
      // 移动端侧边栏
      if (this.sidebarToggle) {
        this.sidebarToggle.addEventListener('click', () => {
          const sidebar = d.querySelector('.sidebar');
          if (sidebar) {
            sidebar.classList.toggle('mobile-open');
          }
        });
      }
    },
    
    highlightCurrentNav() {
      const currentPath = window.location.pathname;
      const navLinks = d.querySelectorAll('.nav-links a');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath.includes(href) && href !== 'index.html') ||
            (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('index.html')))) {
          link.classList.add('active');
        }
      });
    }
  };

  // ==================== Toast 提示 ====================
  const Toast = {
    show(message, type = 'default', duration = 3000) {
      const existing = d.querySelector('.toast');
      if (existing) existing.remove();
      
      const toast = d.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      d.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, duration);
    },
    
    success(message) {
      this.show(message, 'success');
    },
    
    error(message) {
      this.show(message, 'error');
    }
  };

  // ==================== 工具函数 ====================
  const Utils = {
    // 格式化日期
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 格式化日期时间
    formatDateTime(dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 截取文本
    truncate(str, length = 100) {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    },
    
    // 获取 URL 参数
    getUrlParam(name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    },
    
    // 生成唯一 ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 防抖
    debounce(fn, delay = 300) {
      let timer = null;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    
    // 节流
    throttle(fn, delay = 300) {
      let last = 0;
      return function(...args) {
        const now = Date.now();
        if (now - last >= delay) {
          last = now;
          fn.apply(this, args);
        }
      };
    },
    
    // 邮箱验证
    validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // 存储点赞/收藏状态
    getLikedArticles() {
      return JSON.parse(localStorage.getItem('overrain-liked') || '[]');
    },
    
    setArticleLiked(id) {
      const liked = this.getLikedArticles();
      if (!liked.includes(id)) {
        liked.push(id);
        localStorage.setItem('overrain-liked', JSON.stringify(liked));
      }
    },
    
    isArticleLiked(id) {
      return this.getLikedArticles().includes(id);
    },
    
    getCollectedArticles() {
      return JSON.parse(localStorage.getItem('overrain-collected') || '[]');
    },
    
    setArticleCollected(id) {
      const collected = this.getCollectedArticles();
      if (!collected.includes(id)) {
        collected.push(id);
        localStorage.setItem('overrain-collected', JSON.stringify(collected));
      }
    },
    
    isArticleCollected(id) {
      return this.getCollectedArticles().includes(id);
    }
  };

  // ==================== 图片懒加载 ====================
  const LazyLoad = {
    init() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        });
        
        d.querySelectorAll('img[data-src]').forEach(img => {
          observer.observe(img);
        });
      }
    }
  };

  // ==================== 图片放大 ====================
  const ImageZoom = {
    init() {
      d.querySelectorAll('.article-content img').forEach(img => {
        img.addEventListener('click', () => this.open(img.src));
      });
    },
    
    open(src) {
      const modal = d.createElement('div');
      modal.className = 'image-modal';
      modal.innerHTML = `<img src="${src}" alt="放大图片">`;
      
      modal.addEventListener('click', () => this.close(modal));
      d.body.appendChild(modal);
      d.body.style.overflow = 'hidden';
    },
    
    close(modal) {
      modal.remove();
      d.body.style.overflow = '';
    }
  };

  // ==================== 代码复制 ====================
  const CodeCopy = {
    init() {
      d.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'code-copy-btn';
        btn.textContent = '复制';
        btn.addEventListener('click', () => this.copy(pre, btn));
        pre.style.position = 'relative';
        pre.appendChild(btn);
      });
    },
    
    async copy(pre, btn) {
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;
      
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '已复制!';
        setTimeout(() => {
          btn.textContent = '复制';
        }, 2000);
      } catch (err) {
        Toast.error('复制失败');
      }
    }
  };

  // ==================== 分页组件 ====================
  class Pagination {
    constructor(options) {
      this.container = options.container;
      this.currentPage = options.currentPage || 1;
      this.totalPages = options.totalPages || 1;
      this.onChange = options.onChange || (() => {});
      this.render();
    }
    
    render() {
      if (!this.container) return;
      if (this.totalPages <= 1) {
        this.container.innerHTML = '';
        return;
      }
      
      let html = '';
      
      // 上一页
      html += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
        <i class="ri-arrow-left-s-line"></i>
      </button>`;
      
      // 页码
      const pages = this.getPages();
      pages.forEach(page => {
        if (page === '...') {
          html += `<span>...</span>`;
        } else {
          html += `<button class="${page === this.currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
        }
      });
      
      // 下一页
      html += `<button ${this.currentPage === this.totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
        <i class="ri-arrow-right-s-line"></i>
      </button>`;
      
      this.container.innerHTML = html;
      
      // 绑定事件
      this.container.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.render();
            this.onChange(page);
          }
        });
      });
    }
    
    getPages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        if (current > 3) pages.push('...');
        
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
          pages.push(i);
        }
        
        if (current < total - 2) pages.push('...');
        pages.push(total);
      }
      
      return pages;
    }
  }

  // ==================== 初始化 ====================
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navbar.init();
    LazyLoad.init();
    ImageZoom.init();
    CodeCopy.init();
  });

  // 导出到全局
  window.ThemeManager = ThemeManager;
  window.Navbar = Navbar;
  window.Toast = Toast;
  window.Utils = Utils;
  window.LazyLoad = LazyLoad;
  window.ImageZoom = ImageZoom;
  window.CodeCopy = CodeCopy;
  window.Pagination = Pagination;

})(document);
