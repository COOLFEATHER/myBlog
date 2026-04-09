/**
 * project.js - 项目页 JavaScript
 */

;((d, w) => {
  'use strict';

  const CONFIG = {
    pageSize: 6,
    apiBase: API_CONFIG.apiBase
  };

  let state = {
    projects: [],
    currentPage: 1,
    totalPages: 1
  };

  const elements = {
    projectsGrid: d.querySelector('#projectsGrid'),
    pagination: d.querySelector('#pagination')
  };

  async function fetchProjects(page = 1) {
    const params = new URLSearchParams({
      page,
      pageSize: CONFIG.pageSize
    });
    
    const res = await fetch(`${CONFIG.apiBase}/projects?${params}`);
    if (!res.ok) throw new Error('获取项目失败');
    return res.json();
  }

  function renderProjects(projects) {
    if (!elements.projectsGrid) return;
    
    if (!projects || projects.length === 0) {
      elements.projectsGrid.innerHTML = `
        <div class="empty-state">
          <i class="ri-folder-open-line"></i>
          <p>暂无项目</p>
        </div>
      `;
      return;
    }

    const html = projects.map(project => {
      const techHtml = (project.tech || project.techStack || []).map(t => 
        `<span>${t}</span>`
      ).join('');
      
      const statusClass = project.status === '已完成' ? 'completed' : 'in-progress';
      const statusText = project.status === '已完成' ? '已完成' : '进行中';
      
      const demoLink = project.demo || project.link || '#';
      const repoLink = project.repo || '#';
      
      return `
        <div class="project-card">
          <h3 class="project-name" onclick="window.open('${demoLink}', '_blank')">
            ${project.name}
          </h3>
          <p class="project-description">${project.description || ''}</p>
          <div class="project-tech">
            ${techHtml}
          </div>
          <div class="project-footer">
            <span class="project-status ${statusClass}">${statusText}</span>
            <div class="project-links">
              ${repoLink !== '#' ? `<a href="${repoLink}" target="_blank"><i class="ri-github-line"></i> 源码</a>` : ''}
              ${demoLink !== '#' ? `<a href="${demoLink}" target="_blank"><i class="ri-external-link-line"></i> 演示</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    elements.projectsGrid.innerHTML = html;
  }

  function renderPagination(currentPage, totalPages) {
    if (!elements.pagination) return;
    
    if (totalPages <= 1) {
      elements.pagination.innerHTML = '';
      return;
    }
    
    new Pagination({
      container: elements.pagination,
      currentPage,
      totalPages,
      onChange: (page) => {
        state.currentPage = page;
        loadProjects();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  async function loadProjects() {
    try {
      if (elements.projectsGrid) {
        elements.projectsGrid.innerHTML = `
          <div class="article-skeleton"></div>
          <div class="article-skeleton"></div>
        `;
      }
      
      const data = await fetchProjects(state.currentPage);
      state.projects = data.projects || [];
      state.totalPages = data.totalPages || 1;
      
      renderProjects(state.projects);
      renderPagination(state.currentPage, state.totalPages);
    } catch (error) {
      console.error('加载项目失败:', error);
      if (elements.projectsGrid) {
        elements.projectsGrid.innerHTML = `
          <div class="empty-state">
            <i class="ri-error-warning-line"></i>
            <p>数据加载失败，请刷新重试</p>
          </div>
        `;
      }
    }
  }

  async function init() {
    await loadProjects();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
