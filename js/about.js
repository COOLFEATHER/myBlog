/**
 * about.js - 关于页 JavaScript
 */

;((d, w) => {
  'use strict';

  // 个人信息数据
  const aboutData = {
    name: 'OVERRAIN',
    role: '自救小透明',
    bio: '亦欲以究天人之际，通今古之变，成一家之言。',
    avatar: '🌙',
    skills: [
      'HTML5', 'CSS3', 'JavaScript', 'TypeScript',
      'Vue.js', 'React', 'Node.js',
      'Python', 'Docker', 'Git'
    ],
    education: [
      {
        date: '2020 - 2027',
        title: '北京航空航天大学',
        subtitle: '本硕'
      }
    ],
    experience: [
      {
        date: '2002 - 至今',
        title: 'STEAM高级用户',
        subtitle: '一天不玩，相当于一天不玩'
      }
    ],
    contact: [
      { name: 'GitHub', icon: 'ri-github-line', url: 'https://github.com/COOLFEATHER', color: '#333' },
      { name: 'CSDN', icon: 'ri-baidu-line', url: 'https://blog.csdn.net/', color: '#00C750' },
      { name: '邮箱', icon: 'ri-mail-line', url: 'mailto:thebestlxy@163.com', color: '#165DFF' }
    ]
  };

  function renderAbout() {
    // 渲染头像
    const avatarEl = d.querySelector('#aboutAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = aboutData.avatar;
    }

    // 渲染基本信息
    const nameEl = d.querySelector('#aboutName');
    if (nameEl) nameEl.textContent = aboutData.name;

    const roleEl = d.querySelector('#aboutRole');
    if (roleEl) roleEl.textContent = aboutData.role;

    const bioEl = d.querySelector('#aboutBio');
    if (bioEl) bioEl.textContent = aboutData.bio;

    // 渲染技能
    const skillsEl = d.querySelector('#skillsGrid');
    if (skillsEl) {
      skillsEl.innerHTML = aboutData.skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
      ).join('');
    }

    // 渲染教育经历
    const educationEl = d.querySelector('#educationTimeline');
    if (educationEl) {
      educationEl.innerHTML = aboutData.education.map(item => `
        <div class="timeline-item">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-subtitle">${item.subtitle}</div>
        </div>
      `).join('');
    }

    // 渲染工作经历
    const experienceEl = d.querySelector('#experienceTimeline');
    if (experienceEl) {
      experienceEl.innerHTML = aboutData.experience.map(item => `
        <div class="timeline-item">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-subtitle">${item.subtitle}</div>
        </div>
      `).join('');
    }

    // 渲染联系方式
    const contactEl = d.querySelector('#contactList');
    if (contactEl) {
      contactEl.innerHTML = aboutData.contact.map(item => `
        <a href="${item.url}" class="contact-item" target="_blank" rel="noopener noreferrer">
          <i class="${item.icon}" style="color: ${item.color}"></i>
          <span>${item.name}</span>
        </a>
      `).join('');
    }
  }

  function init() {
    renderAbout();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(document, window);
