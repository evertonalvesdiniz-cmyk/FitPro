/* ============================================================
   MÓDULO: Auth — Autenticação
============================================================ */
const Auth = {
  CREDENTIALS: { email: 'admin@fitpro.com', senha: '123456' },

  init() {
    // Toggle senha
    document.getElementById('togglePassword')?.addEventListener('click', () => {
      const inp = document.getElementById('loginPassword');
      const icon = document.querySelector('#togglePassword i');
      if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fa-solid fa-eye-slash'; }
      else { inp.type = 'password'; icon.className = 'fa-solid fa-eye'; }
    });

    // Enter no login
    document.getElementById('loginPassword')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') Auth.doLogin();
    });

    // Verificar sessão salva
    const saved = localStorage.getItem(DB.KEYS.session);
    if (saved === 'active') Auth.showApp();
  },

  doLogin() {
    const email = Utils.val('loginEmail');
    const senha = Utils.val('loginPassword');
    const remember = document.getElementById('rememberMe')?.checked;

    if (email !== Auth.CREDENTIALS.email || senha !== Auth.CREDENTIALS.senha) {
      Utils.toast('E-mail ou senha incorretos!', 'error');
      document.getElementById('loginPassword').value = '';
      return;
    }

    if (remember) localStorage.setItem(DB.KEYS.session, 'active');
    Auth.showApp();
    Utils.toast('Bem-vindo de volta! 👋', 'success');
  },

  doLogout() {
    Utils.confirm('Sair do sistema', 'Tem certeza que deseja encerrar a sessão?', () => {
      localStorage.removeItem(DB.KEYS.session);
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      document.getElementById('appMain').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
    });
  },

  showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appMain').classList.remove('hidden');
    App.init();
  }
};
