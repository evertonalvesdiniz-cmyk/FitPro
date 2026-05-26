/* ============================================================
   MÓDULO: UI — Interface, tema, sidebar, busca global
============================================================ */
const UI = {

  init() {
    UI.applyConfig();
    UI.initSidebarCollapse();
  },

  applyConfig() {
    const cfg = DB.getConfig();

    // Nome na sidebar e topbar
    const firstName = (cfg.nome || 'Carlos').split(' ')[0];
    Utils.setText('sidebarName', cfg.nome || 'Carlos Silva');
    Utils.setText('greetName', firstName);

    // Avatares (DiceBear baseado no nome)
    const url = Utils.avatarUrl(cfg.nome || 'Carlos Silva');
    ['sidebarAvatar','topbarAvatar','configAvatar'].forEach(id => {
      const el = Utils.el(id);
      if (el) el.src = url;
    });

    // Tema
    if (cfg.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      Utils.el('themeIcon')?.classList.replace('fa-moon','fa-sun');
      const toggle = Utils.el('themeToggle');
      if (toggle) toggle.checked = true;
    } else {
      document.documentElement.removeAttribute('data-theme');
      Utils.el('themeIcon')?.classList.replace('fa-sun','fa-moon');
      const toggle = Utils.el('themeToggle');
      if (toggle) toggle.checked = false;
    }

    // Cor de destaque
    const accent = cfg.accent || '#10b981';
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-dim', accent + '22');
  },

  toggleTheme() {
    const cfg = DB.getConfig();
    cfg.theme = cfg.theme === 'light' ? 'dark' : 'light';
    DB.setConfig(cfg);
    UI.applyConfig();
    Utils.toast(`Tema ${cfg.theme === 'light' ? 'claro' : 'escuro'} ativado!`, 'info');
  },

  toggleSidebar() {
    const sidebar = Utils.el('sidebar');
    const content = Utils.el('mainContent');
    if (!sidebar) return;

    if (window.innerWidth <= 900) {
      // Mobile: desliza
      sidebar.classList.toggle('mobile-open');
    } else {
      // Desktop: colapsa
      const collapsed = sidebar.classList.toggle('collapsed');
      if (content) content.classList.toggle('sidebar-collapsed', collapsed);
      const cfg = DB.getConfig();
      cfg._sidebarCollapsed = collapsed;
      DB.setConfig(cfg);
    }
  },

  initSidebarCollapse() {
    const cfg = DB.getConfig();
    if (cfg._sidebarCollapsed && window.innerWidth > 900) {
      Utils.el('sidebar')?.classList.add('collapsed');
      Utils.el('mainContent')?.classList.add('sidebar-collapsed');
    }

    // Fecha sidebar mobile ao clicar fora
    document.addEventListener('click', e => {
      const sidebar = Utils.el('sidebar');
      if (!sidebar || window.innerWidth > 900) return;
      if (sidebar.classList.contains('mobile-open') &&
          !sidebar.contains(e.target) &&
          !e.target.closest('.sidebar-toggle-mobile')) {
        sidebar.classList.remove('mobile-open');
      }
    });
  },

  toggleAlerts() {
    Utils.el('alertsPanel')?.classList.toggle('hidden');
    if (!Utils.el('alertsPanel')?.classList.contains('hidden')) {
      Dashboard.renderQuickAlerts();
    }
  },

  /* ── Busca global ── */
  globalSearch() {
    const q = Utils.val('globalSearch').toLowerCase();
    const container = Utils.el('searchResults');
    if (!container) return;

    if (!q || q.length < 2) { container.innerHTML = ''; container.classList.add('hidden'); return; }

    const alunos = DB.get('alunos').filter(a =>
      a.nome.toLowerCase().includes(q) ||
      (a.email||'').toLowerCase().includes(q) ||
      (a.telefone||'').includes(q)
    ).slice(0, 6);

    if (alunos.length === 0) {
      container.innerHTML = `<div style="padding:0.75rem 1rem;font-size:0.82rem;color:var(--text-muted)">Nenhum resultado encontrado.</div>`;
      container.classList.remove('hidden');
      return;
    }

    container.innerHTML = alunos.map(a => `
      <div class="search-result-item" onclick="UI.goToAluno('${a.id}')">
        <img src="${Utils.avatarUrl(a.nome)}" style="width:28px;height:28px;border-radius:7px" />
        <div>
          <div style="font-weight:600;font-size:0.82rem">${a.nome}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${a.email||a.telefone||'Aluno'}</div>
        </div>
        ${Utils.badge(a.status)}
      </div>`).join('');

    container.classList.remove('hidden');
  },

  goToAluno(id) {
    Utils.el('globalSearch').value = '';
    Utils.el('searchResults').classList.add('hidden');
    Router.navigate('alunos');
    setTimeout(() => Alunos.openModal(id), 350);
  },
};
