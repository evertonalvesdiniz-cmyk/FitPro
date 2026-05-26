/* ============================================================
   MÓDULO: Configurações — Perfil, tema e horários
============================================================ */
const Configuracoes = {

  DIAS: ['segunda','terca','quarta','quinta','sexta','sabado','domingo'],
  DIAS_LABEL: ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],

  render() {
    const cfg = DB.getConfig();
    Utils.setVal('cfgNome', cfg.nome);
    Utils.setVal('cfgTelefone', cfg.telefone);
    Utils.setVal('cfgEmail', cfg.email);
    Utils.setVal('cfgEspec', cfg.especialidade);

    // Avatar
    const avatarUrl = Utils.avatarUrl(cfg.nome);
    const configAvatar = Utils.el('configAvatar');
    if (configAvatar) configAvatar.src = avatarUrl;

    // Tema
    const isLight = cfg.theme === 'light';
    const themeToggle = Utils.el('themeToggle');
    if (themeToggle) themeToggle.checked = isLight;

    // Cor de destaque
    Configuracoes.renderColorOptions(cfg.accent || '#10b981');

    // Horários
    Configuracoes.renderHorarios(cfg.horarios);
  },

  renderColorOptions(activeColor) {
    const colors = [
      { hex: '#10b981', name: 'Verde Esmeralda' },
      { hex: '#6366f1', name: 'Índigo' },
      { hex: '#f59e0b', name: 'Âmbar' },
      { hex: '#ec4899', name: 'Rosa' },
      { hex: '#14b8a6', name: 'Teal' },
      { hex: '#ef4444', name: 'Vermelho' },
      { hex: '#8b5cf6', name: 'Violeta' },
      { hex: '#0ea5e9', name: 'Azul Céu' },
    ];
    const container = Utils.el('colorOptions');
    if (!container) return;
    container.innerHTML = colors.map(c => `
      <span class="color-opt ${c.hex === activeColor ? 'active' : ''}"
        style="background:${c.hex};box-shadow:${c.hex === activeColor ? '0 0 0 3px white, 0 0 0 5px '+c.hex : 'none'}"
        title="${c.name}"
        onclick="Configuracoes.setAccent('${c.hex}')">
      </span>`).join('');
  },

  renderHorarios(horarios) {
    const container = Utils.el('horariosConfig');
    if (!container) return;
    container.innerHTML = Configuracoes.DIAS.map((dia, i) => {
      const h = horarios?.[dia] || { ativo: true, inicio: '07:00', fim: '21:00' };
      return `
        <div class="horario-row">
          <label class="check-label" style="width:100px">
            <input type="checkbox" id="hr_ativo_${dia}" ${h.ativo ? 'checked' : ''} onchange="Configuracoes.toggleDia('${dia}')" />
            <span style="font-size:0.82rem">${Configuracoes.DIAS_LABEL[i]}</span>
          </label>
          <input id="hr_inicio_${dia}" type="time" value="${h.inicio||'07:00'}" ${!h.ativo ? 'disabled' : ''} style="width:110px" />
          <span style="color:var(--text-muted);font-size:0.8rem">até</span>
          <input id="hr_fim_${dia}" type="time" value="${h.fim||'21:00'}" ${!h.ativo ? 'disabled' : ''} style="width:110px" />
        </div>`;
    }).join('');
  },

  toggleDia(dia) {
    const ativo = Utils.el(`hr_ativo_${dia}`)?.checked;
    const inicio = Utils.el(`hr_inicio_${dia}`);
    const fim = Utils.el(`hr_fim_${dia}`);
    if (inicio) inicio.disabled = !ativo;
    if (fim) fim.disabled = !ativo;
  },

  save() {
    const cfg = DB.getConfig();
    cfg.nome = Utils.val('cfgNome') || cfg.nome;
    cfg.telefone = Utils.val('cfgTelefone');
    cfg.email = Utils.val('cfgEmail');
    cfg.especialidade = Utils.val('cfgEspec');

    // Horários
    Configuracoes.DIAS.forEach(dia => {
      cfg.horarios[dia] = {
        ativo: Utils.el(`hr_ativo_${dia}`)?.checked || false,
        inicio: Utils.el(`hr_inicio_${dia}`)?.value || '07:00',
        fim: Utils.el(`hr_fim_${dia}`)?.value || '21:00',
      };
    });

    DB.setConfig(cfg);

    // Atualiza UI
    UI.applyConfig();
    Utils.toast('Configurações salvas com sucesso! ✅', 'success');
  },

  setAccent(color) {
    const cfg = DB.getConfig();
    cfg.accent = color;
    DB.setConfig(cfg);
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-dim', color + '22');
    Configuracoes.renderColorOptions(color);
    Utils.toast('Cor de destaque aplicada!', 'success');
  },

  exportData() {
    const data = {
      alunos: DB.get('alunos'),
      planos: DB.get('planos'),
      aulas: DB.get('aulas'),
      pagamentos: DB.get('pagamentos'),
      config: DB.getConfig(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpro-backup-${Utils.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('Dados exportados com sucesso!', 'success');
  },

  confirmClear() {
    Utils.confirm(
      '⚠️ Limpar Todos os Dados',
      'Isso apagará TODOS os dados do sistema (alunos, aulas, pagamentos). Esta ação é IRREVERSÍVEL. Tem certeza?',
      () => {
        ['alunos','planos','aulas','pagamentos','waHistory','emailHistory'].forEach(k => {
          localStorage.removeItem(DB.KEYS[k]);
        });
        DB.seed();
        Router.navigate('dashboard');
        Utils.toast('Dados reiniciados com dados de demonstração.', 'info');
      }
    );
  }
};
