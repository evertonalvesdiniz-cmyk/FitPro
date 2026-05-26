/* ============================================================
   APP.JS — Inicialização principal do FitPro
============================================================ */
const App = {

  init() {
    try { DB.seed(); } catch(e) { console.error('[App] Erro no seed:', e); }
    try { UI.init(); } catch(e) { console.error('[App] Erro no UI.init:', e); }
    try { Router.init(); } catch(e) { console.error('[App] Erro no Router.init:', e); }
    try { App.checkOverdue(); } catch(e) { console.error('[App] Erro no checkOverdue:', e); }

    // Navega para dashboard com pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      try { Router.navigate('dashboard'); } catch(e) { console.error('[App] Erro ao navegar:', e); }
    }, 50);
  },

  checkOverdue() {
    const today = Utils.today();
    const pagamentos = DB.get('pagamentos');
    let changed = false;
    pagamentos.forEach(p => {
      if (p.status === 'pendente' && p.vencimento && p.vencimento < today) {
        p.status = 'atrasado';
        changed = true;
      }
    });
    if (changed) DB.set('pagamentos', pagamentos);
  }
};

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  // Login desativado para testes — vai direto para o sistema
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appMain').classList.remove('hidden');
  App.init();
});
