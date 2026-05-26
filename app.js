/* ============================================================
   APP.JS — Inicialização principal do FitPro
   Ponto de entrada: instancia todos os módulos em ordem
============================================================ */
const App = {

  init() {
    // 1. Seed de dados mockados (só na primeira vez)
    DB.seed();

    // 2. Inicializa UI (tema, avatar, sidebar)
    UI.init();

    // 3. Inicializa roteador (nav-items)
    Router.init();

    // 4. Navega para o dashboard
    Router.navigate('dashboard');

    // 5. Atualiza inadimplência automaticamente
    App.checkOverdue();

    console.log('✅ FitPro iniciado com sucesso!');
  },

  /* Marca como "atrasado" pagamentos com vencimento passado e status pendente */
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

/* ── Bootstrap na carga do DOM ── */
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
