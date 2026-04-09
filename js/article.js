/**
 * article.js - 文章详情页 JavaScript
 */

;((d, w) => {
  'use strict';

  // ==================== 配置 ====================
  const CONFIG = {
    apiBase: '/api'
  };

  // ==================== 元素引用 ====================
  const elements = {
    articleHeader: d.querySelector('#articleHeader'),
    articleContent: d.querySelector('#articleContent'),
    articleNav: d.querySelector('#articleNav'),
    articleActions: d.querySelector('#articleActions'),
    commentsSection: d.querySelector('#commentsSection'),
    commentsList: d.querySelector('#commentsList'),
    commentForm: d.querySelector('#commentForm')
  };

  // ==================== 状态 ====================
  let article = null;
  let comments = [];
  let articleId = null;

  // ==================== API 请求 ====================
  async function fetchArticle(id) {
    console.log('[Article] 开始获取文章, id:', id);
    const res = await fetch(`${CONFIG.apiBase}/articles/${id}`);
    console.log('[Article] 响应状态:', res.status);
    if (!res.ok) throw new Error('获取文章失败');
    const data = await res.json();
    console.log('[Article] 获取到文章:', data.title);
    return data;
  }

  async function fetchComments() {
    console.log('[Comments] 开始获取留言');
    const res = await fetch(`${CONFIG.apiBase}/messages`);
    console.log('[Comments] 响应状态:', res.status);
    if (!res.ok) throw new Error('获取留言失败');
    const data = await res.json();
    console.log('[Comments] 获取到留言数:', (data.messages || []).length);
    return data;
  }

  async function postComment(data) {
    const res = await fetch(`${CONFIG.apiBase}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '提交留言失败');
    }
    return res.json();
  }

  async function incrementReadCount(id) {
    try {
      await fetch(`${CONFIG.apiBase}/articles/read/${id}`, { method: 'POST' });
    } catch (e) {
      console.error('更新阅读量失败:', e);
    }
  }

  async function incrementLikeCount(id) {
    try {
      await fetch(`${CONFIG.apiBase}/articles/like/${id}`, { method: 'POST' });
    } catch (e) {
      console.error('更新点赞数失败:', e);
    }
  }

  async function incrementCollectCount(id) {
    try {
      await fetch(`${CONFIG.apiBase}/articles/collect/${id}`, { method: 'POST' });
    } catch (e) {
      console.error('更新收藏数失败:', e);
    }
  }

  // ==================== Markdown 渲染 ====================
  function renderMarkdown(content) {
    if (!content) return '';
    
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    return `<p>${html}</p>`;
  }

  // ==================== 渲染函数 ====================
  function renderHeader() {
    if (!elements.articleHeader || !article) return;

    const tagsHtml = article.tags.map(tag => 
      `<a href="tag.html?name=${encodeURIComponent(tag)}" class="article-tag">${tag}</a>`
    ).join('');

    elements.articleHeader.innerHTML = `
      <a href="index.html" class="back-link">
        <i class="ri-arrow-left-line"></i> 返回首页
      </a>
      <h1 class="article-page-title">${article.title}</h1>
      <div class="article-page-meta">
        <span><i class="ri-calendar-line"></i> ${Utils.formatDate(article.createTime)}</span>
        <span><i class="ri-folder-line"></i> <a href="category.html?name=${encodeURIComponent(article.category)}">${article.category}</a></span>
        <span><i class="ri-eye-line"></i> ${article.readCount || 0} 阅读</span>
      </div>
      <div class="article-page-meta" style="margin-top: 8px;">
        ${tagsHtml}
      </div>
    `;
  }

  function renderContent() {
    if (!elements.articleContent || !article) return;

    elements.articleContent.innerHTML = `
      <div class="article-content">
        ${renderMarkdown(article.content)}
      </div>
    `;

    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
    CodeCopy.init();
    ImageZoom.init();
  }

  function renderNav(prevArticle, nextArticle) {
    if (!elements.articleNav) return;

    const prevHtml = prevArticle 
      ? `<a href="article.html?id=${prevArticle.id}" class="article-nav-item prev">
          <div class="article-nav-label"><i class="ri-arrow-left-line"></i> 上一篇</div>
          <div class="article-nav-title">${prevArticle.title}</div>
        </a>`
      : `<div class="article-nav-item prev">
          <div class="article-nav-label"><i class="ri-arrow-left-line"></i> 上一篇</div>
          <div class="article-nav-title" style="color: var(--color-text-light);">没有更多文章了</div>
        </div>`;

    const nextHtml = nextArticle 
      ? `<a href="article.html?id=${nextArticle.id}" class="article-nav-item next">
          <div class="article-nav-label">下一篇 <i class="ri-arrow-right-line"></i></div>
          <div class="article-nav-title">${nextArticle.title}</div>
        </a>`
      : `<div class="article-nav-item next">
          <div class="article-nav-label">下一篇 <i class="ri-arrow-right-line"></i></div>
          <div class="article-nav-title" style="color: var(--color-text-light);">没有更多文章了</div>
        </div>`;

    elements.articleNav.innerHTML = prevHtml + nextHtml;
  }

  function renderActions() {
    if (!elements.articleActions) return;

    const isLiked = Utils.isArticleLiked(articleId);
    const isCollected = Utils.isArticleCollected(articleId);

    elements.articleActions.innerHTML = `
      <button class="action-btn ${isLiked ? 'liked' : ''}" id="likeBtn">
        <i class="${isLiked ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
        <span id="likeCountEl">${article.likeCount || 0}</span> 点赞
      </button>
      <button class="action-btn ${isCollected ? 'collected' : ''}" id="collectBtn">
        <i class="${isCollected ? 'ri-star-fill' : 'ri-star-line'}"></i>
        <span id="collectCountEl">${article.collectCount || 0}</span> 收藏
      </button>
      <button class="action-btn" id="shareBtn">
        <i class="ri-share-line"></i> 分享
      </button>
    `;

    d.querySelector('#likeBtn')?.addEventListener('click', handleLike);
    d.querySelector('#collectBtn')?.addEventListener('click', handleCollect);
    d.querySelector('#shareBtn')?.addEventListener('click', handleShare);
  }

  function renderComments(commentList) {
    if (!elements.commentsList) return;

    if (!commentList || commentList.length === 0) {
      elements.commentsList.innerHTML = `
        <div class="empty-state">
          <i class="ri-chat-3-line"></i>
          <p>暂无留言，快来抢沙发吧！</p>
        </div>
      `;
      return;
    }

    const html = commentList.map(comment => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${comment.nickname}</span>
          <span class="comment-date">${Utils.formatDateTime(comment.createTime)}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
      </div>
    `).join('');

    elements.commentsList.innerHTML = html;
  }

  // ==================== 事件处理 ====================
  async function handleLike() {
    if (!articleId) return;
    
    const btn = d.querySelector('#likeBtn');
    const countEl = d.querySelector('#likeCountEl');
    const isLiked = btn?.classList.contains('liked');
    
    if (isLiked) {
      Toast.show('已经点过赞了~');
      return;
    }

    try {
      await incrementLikeCount(articleId);
      Utils.setArticleLiked(articleId);
      
      if (btn) btn.classList.add('liked');
      const icon = btn?.querySelector('i');
      if (icon) icon.className = 'ri-heart-fill';
      
      if (countEl) {
        countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
      }
      
      Toast.success('点赞成功！');
    } catch (error) {
      Toast.error('点赞失败');
    }
  }

  async function handleCollect() {
    if (!articleId) return;
    
    const btn = d.querySelector('#collectBtn');
    const countEl = d.querySelector('#collectCountEl');
    const isCollected = btn?.classList.contains('collected');
    
    if (isCollected) {
      Toast.show('已经收藏过了~');
      return;
    }

    try {
      await incrementCollectCount(articleId);
      Utils.setArticleCollected(articleId);
      
      if (btn) btn.classList.add('collected');
      const icon = btn?.querySelector('i');
      if (icon) icon.className = 'ri-star-fill';
      
      if (countEl) {
        countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
      }
      
      Toast.success('收藏成功！');
    } catch (error) {
      Toast.error('收藏失败');
    }
  }

  function handleShare() {
    const url = window.location.href;
    const title = article?.title || '分享文章';
    
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        Toast.success('链接已复制到剪贴板');
      }).catch(() => {
        Toast.error('复制失败');
      });
    }
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    
    const nickname = d.querySelector('#nickname')?.value.trim();
    const email = d.querySelector('#email')?.value.trim();
    const content = d.querySelector('#content')?.value.trim();
    
    let hasError = false;
    
    if (!nickname) {
      showFieldError('#nickname', '请输入昵称');
      hasError = true;
    } else if (nickname.length > 10) {
      showFieldError('#nickname', '昵称不能超过10个字符');
      hasError = true;
    }
    
    if (!email) {
      showFieldError('#email', '请输入邮箱');
      hasError = true;
    } else if (!Utils.validateEmail(email)) {
      showFieldError('#email', '请输入正确的邮箱地址');
      hasError = true;
    }
    
    if (!content) {
      showFieldError('#content', '请输入留言内容');
      hasError = true;
    }
    
    if (hasError) return;
    
    const submitBtn = d.querySelector('#submitComment');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中...';
    }
    
    postComment({ nickname, email, content })
      .then(() => {
        Toast.success('留言成功，感谢互动！');
        d.querySelector('#commentForm')?.reset();
        loadComments();
      })
      .catch(error => {
        Toast.error(error.message || '提交失败');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '提交留言';
        }
      });
  }

  function showFieldError(fieldId, message) {
    const field = d.querySelector(fieldId);
    if (!field) return;
    
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    
    field.addEventListener('input', () => {
      if (errorEl) errorEl.style.display = 'none';
    }, { once: true });
  }

  // ==================== 加载数据 ====================
  async function loadArticle() {
    articleId = Utils.getUrlParam('id');
    
    if (!articleId) {
      showError('文章ID不存在');
      return;
    }

    try {
      // 显示加载状态
      if (elements.articleHeader) {
        elements.articleHeader.innerHTML = `<div class="loading">加载中...</div>`;
      }

      article = await fetchArticle(articleId);
      
      if (!article) {
        showError('文章不存在');
        return;
      }

      document.title = `${article.title} - OVERRAIN`;

      renderHeader();
      renderContent();
      renderActions();
      renderNav(article.prevArticle, article.nextArticle);

      await incrementReadCount(articleId);
    } catch (error) {
      console.error('加载文章失败:', error);
      showError('文章加载失败，请刷新重试');
    }
  }

  async function loadComments() {
    try {
      const data = await fetchComments();
      comments = data.messages || [];
      renderComments(comments);
    } catch (error) {
      console.error('加载留言失败:', error);
    }
  }

  function showError(message) {
    if (elements.articleHeader) {
      elements.articleHeader.innerHTML = `
        <div class="empty-state" style="margin-top: 100px;">
          <i class="ri-error-warning-line"></i>
          <p>${message}</p>
          <a href="index.html" class="submit-btn" style="display: inline-block; margin-top: 20px;">返回首页</a>
        </div>
      `;
    }
  }

  // ==================== 初始化 ====================
  async function init() {
    await loadArticle();
    await loadComments();
    
    if (elements.commentForm) {
      elements.commentForm.addEventListener('submit', handleCommentSubmit);
    }
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
