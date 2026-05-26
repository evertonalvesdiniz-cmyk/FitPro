/* ============================================================
   MÓDULO: Planos — CRUD de planos de treino
============================================================ */
const Planos = {

  render() {
    Planos.renderGrid();
  },

  renderGrid() {
    const planos = DB.get('planos');
    const alunos = DB.get('alunos');
    const container = Utils.el('planosGrid');
    if (!container) return;

    if (planos.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)"><i class="fa-solid fa-star" style="font-size:2rem;display:block;margin-bottom:0.75rem"></i>Nenhum plano cadastrado</div>`;
      return;
    }

    const accents = ['#10b981','#6366f1','#f59e0b','#ec4899','#14b8a6','#8b5cf6'];
    container.innerHTML = planos.map((p, i) => {
      const color = accents[i % accents.length];
      const qtdAlunos = alunos.filter(a => a.plano === p.id && a.status === 'ativo').length;
      return `
        <div class="plano-card" style="--accent:${color}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div class="plano-freq">${p.frequencia}x</div>
            ${Utils.badge(p.status)}
          </div>
          <div class="plano-name">${p.nome}</div>
          ${p.descricao ? `<div class="plano-desc">${p.descricao}</div>` : ''}
          <div class="plano-value" style="color:${color}">${Utils.formatCurrency(p.valor)}<small style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">/mês</small></div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;font-size:0.78rem;color:var(--text-muted)">
            <span><i class="fa-solid fa-calendar-week"></i> ${p.frequencia}x semana</span>
            <span><i class="fa-solid fa-hourglass"></i> ${p.duracao} mês(es)</span>
            <span><i class="fa-solid fa-tag"></i> ${p.tipo}</span>
          </div>
          <div class="plano-footer">
            <span class="plano-alunos"><i class="fa-solid fa-users"></i> ${qtdAlunos} aluno(s) ativo(s)</span>
            <div class="action-btns">
              <button class="action-btn edit" onclick="Planos.openModal('${p.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn del" onclick="Planos.confirmDelete('${p.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  openModal(id = null) {
    Utils.el('planoEditId').value = id || '';
    Utils.setHtml('modalPlanoTitle', id ? 'Editar Plano' : 'Novo Plano');

    if (id) {
      const p = DB.findById('planos', id);
      if (!p) return;
      Utils.setVal('pNome', p.nome);    Utils.setVal('pValor', p.valor);
      Utils.setVal('pFreq', p.frequencia); Utils.setVal('pDuracao', p.duracao);
      Utils.setVal('pTipo', p.tipo);    Utils.setVal('pStatus', p.status);
      Utils.setVal('pDesc', p.descricao);
    } else {
      ['pNome','pValor','pDesc'].forEach(i => Utils.setVal(i, ''));
      Utils.setVal('pFreq', '3'); Utils.setVal('pDuracao', '1');
      Utils.setVal('pTipo', 'mensal'); Utils.setVal('pStatus', 'ativo');
    }
    Utils.openModal('modalPlano');
  },

  save() {
    const nome = Utils.val('pNome');
    const valor = Utils.val('pValor');
    if (!nome || !valor) { Utils.toast('Informe o nome e o valor do plano!', 'warning'); return; }

    const id = Utils.val('planoEditId');
    const data = {
      nome, valor: +valor,
      frequencia: +Utils.val('pFreq') || 3,
      duracao: +Utils.val('pDuracao') || 1,
      tipo: Utils.val('pTipo'),
      status: Utils.val('pStatus'),
      descricao: Utils.val('pDesc'),
    };

    if (id) {
      DB.update('planos', id, data);
      Utils.toast('Plano atualizado!', 'success');
    } else {
      DB.insert('planos', data);
      Utils.toast('Plano criado!', 'success');
    }

    Utils.closeModal('modalPlano');
    Planos.renderGrid();
  },

  confirmDelete(id) {
    const p = DB.findById('planos', id);
    const alunos = DB.get('alunos').filter(a => a.plano === id).length;
    if (alunos > 0) {
      Utils.toast(`Este plano tem ${alunos} aluno(s) vinculado(s). Remova-os primeiro.`, 'warning');
      return;
    }
    Utils.confirm('Excluir Plano', `Tem certeza que deseja excluir "${p?.nome}"?`, () => {
      DB.delete('planos', id);
      Planos.renderGrid();
      Utils.toast('Plano excluído.', 'info');
    });
  }
};
