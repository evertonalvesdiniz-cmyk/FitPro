/* ============================================================
   MÓDULO: Router — Navegação entre páginas
============================================================ */
const Router = {
  currentPage: 'dashboard',

  init() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        Router.navigate(item.dataset.page);
      });
    });
  },

  navigate(page) {
    // Remove active de todos
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Ativa item na sidebar
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Mostra a página
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    // Atualiza breadcrumb
    const titles = {
      dashboard: 'Dashboard', alunos: 'Alunos', agenda: 'Agenda',
      financeiro: 'Financeiro', planos: 'Planos', relatorios: 'Relatórios',
      whatsapp: 'WhatsApp', emails: 'E-mails', configuracoes: 'Configurações'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[page] || page;

    Router.currentPage = page;

    // Fecha sidebar mobile
    if (window.innerWidth <= 900) {
      document.getElementById('sidebar')?.classList.remove('mobile-open');
    }

    // Fecha painel de alertas
    document.getElementById('alertsPanel')?.classList.add('hidden');

    // Inicializa o módulo com try-catch para isolar erros
    try {
      Router.onPageEnter(page);
    } catch(err) {
      console.error(`[Router] Erro ao entrar na página "${page}":`, err);
    }
  },

  onPageEnter(page) {
    switch(page) {
      case 'dashboard':     Dashboard.render();      break;
      case 'alunos':        Alunos.render();         break;
      case 'agenda':        Agenda.initCalendar();   break;
      case 'financeiro':    Financeiro.render();     break;
      case 'planos':        Planos.render();         break;
      case 'relatorios':    Relatorios.render();     break;
      case 'whatsapp':      Whatsapp.render();       break;
      case 'emails':        Emails.render();         break;
      case 'configuracoes': Configuracoes.render();  break;
    }
  }
};
