/* ============================================================
   MÓDULO: Utils — Utilitários Globais
   Funções reutilizáveis em todo o sistema
============================================================ */
const Utils = {

  /* ── IDs únicos ── */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /* ── Formatação de moeda ── */
  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  },

  /* ── Formatação de data ── */
  formatDate(str) {
    if (!str) return '—';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  },

  /* ── Data atual YYYY-MM-DD ── */
  today() {
    return new Date().toISOString().slice(0, 10);
  },

  /* ── Data atual YYYY-MM ── */
  currentMonth() {
    return new Date().toISOString().slice(0, 7);
  },

  /* ── Mês por extenso ── */
  monthName(monthIndex) {
    return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][monthIndex];
  },

  /* ── Iniciais do nome ── */
  initials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  },

  /* ── Avatar via DiceBear ── */
  avatarUrl(name) {
    const seed = encodeURIComponent(name || 'User');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=10b981&fontFamily=Arial&fontSize=38&fontWeight=700`;
  },

  /* ── Badge de status ── */
  badge(status) {
    const map = {
      ativo:      ['badge-status-ativo',      'Ativo'],
      inativo:    ['badge-status-inativo',     'Inativo'],
      pago:       ['badge-status-pago',        'Pago'],
      pendente:   ['badge-status-pendente',    'Pendente'],
      atrasado:   ['badge-status-atrasado',    'Atrasado'],
      cancelado:  ['badge-status-cancelado',   'Cancelado'],
      confirmado: ['badge-status-confirmado',  'Confirmado'],
      concluido:  ['badge-status-concluido',   'Concluído'],
    };
    const [cls, label] = map[status] || ['badge-status-inativo', status];
    return `<span class="badge ${cls}">${label}</span>`;
  },

  /* ── Ícone de forma de pagamento ── */
  payIcon(forma) {
    const icons = { pix:'fa-qrcode', dinheiro:'fa-money-bill', cartao:'fa-credit-card', transferencia:'fa-building-columns' };
    const labels = { pix:'Pix', dinheiro:'Dinheiro', cartao:'Cartão', transferencia:'Transferência' };
    return `<span style="display:flex;align-items:center;gap:0.3rem"><i class="fa-solid ${icons[forma]||'fa-circle'}"></i>${labels[forma]||forma}</span>`;
  },

  /* ══════════════════════════════════════
     TOASTS
  ══════════════════════════════════════ */
  toast(msg, type = 'success', duration = 3500) {
    const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${msg}</span>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  /* ══════════════════════════════════════
     MODAIS
  ══════════════════════════════════════ */
  openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('hidden'); document.body.style.overflow = ''; }
  },

  /* ── Confirmação ── */
  confirm(title, msg, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent = msg;
    const btn = document.getElementById('confirmBtn');
    btn.onclick = () => { Utils.closeModal('modalConfirm'); onConfirm(); };
    Utils.openModal('modalConfirm');
  },

  /* ── Tabs em modais ── */
  switchTab(btn, tabId) {
    const container = btn.closest('.modal-body');
    container.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.mtab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  },

  /* ══════════════════════════════════════
     DOM HELPERS
  ══════════════════════════════════════ */
  el(id) { return document.getElementById(id); },
  val(id) { return (document.getElementById(id)?.value || '').trim(); },
  setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; },
  setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v ?? ''; },
  setHtml(id, v) { const el = document.getElementById(id); if (el) el.innerHTML = v ?? ''; },
  show(id) { document.getElementById(id)?.classList.remove('hidden'); },
  hide(id) { document.getElementById(id)?.classList.add('hidden'); },
  toggle(id) { document.getElementById(id)?.classList.toggle('hidden'); },

  /* ── Preenche <select> com planos ── */
  fillPlanosSelect(selectId, selected = '') {
    const planos = DB.get('planos').filter(p => p.status === 'ativo');
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const first = sel.options[0];
    sel.innerHTML = '';
    if (first) sel.appendChild(first);
    planos.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = `${p.nome} — ${Utils.formatCurrency(p.valor)}`;
      if (p.id === selected) o.selected = true;
      sel.appendChild(o);
    });
  },

  /* ── Preenche <select> com alunos ── */
  fillAlunosSelect(selectId, selected = '', onlyAtivo = false) {
    let alunos = DB.get('alunos');
    if (onlyAtivo) alunos = alunos.filter(a => a.status === 'ativo');
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const first = sel.options[0];
    sel.innerHTML = '';
    if (first) sel.appendChild(first);
    alunos.forEach(a => {
      const o = document.createElement('option');
      o.value = a.id;
      o.textContent = a.nome;
      if (a.id === selected) o.selected = true;
      sel.appendChild(o);
    });
  },

  /* ── Atualiza meses no filtro financeiro ── */
  fillMesesSelect(selectId) {
    const pagamentos = DB.get('pagamentos');
    const meses = [...new Set(pagamentos.map(p => p.referencia).filter(Boolean))].sort().reverse();
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const first = sel.options[0];
    sel.innerHTML = '';
    if (first) sel.appendChild(first);
    meses.forEach(m => {
      const o = document.createElement('option');
      o.value = m;
      const [y, mo] = m.split('-');
      o.textContent = `${Utils.monthName(+mo - 1)} ${y}`;
      sel.appendChild(o);
    });
  },
};
