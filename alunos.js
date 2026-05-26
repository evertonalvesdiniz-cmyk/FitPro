/* ============================================================
   MÓDULO: Alunos — CRUD completo de alunos
============================================================ */
const Alunos = {

  render() {
    Alunos.fillFiltroPlanosSelect();
    Alunos.renderTable();
  },

  fillFiltroPlanosSelect() {
    const sel = Utils.el('alunoFiltroPlano');
    if (!sel) return;
    const planos = DB.get('planos');
    const val = sel.value;
    sel.innerHTML = '<option value="">Todos os planos</option>';
    planos.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id; o.textContent = p.nome;
      if (p.id === val) o.selected = true;
      sel.appendChild(o);
    });
  },

  renderTable() {
    const search = Utils.val('alunoSearch').toLowerCase();
    const filtroStatus = Utils.val('alunoFiltroStatus');
    const filtroPlano = Utils.val('alunoFiltroPlano');
    let alunos = DB.get('alunos');
    const planos = DB.get('planos');

    if (search) alunos = alunos.filter(a =>
      a.nome.toLowerCase().includes(search) ||
      (a.email||'').toLowerCase().includes(search) ||
      (a.telefone||'').includes(search)
    );
    if (filtroStatus) alunos = alunos.filter(a => a.status === filtroStatus);
    if (filtroPlano) alunos = alunos.filter(a => a.plano === filtroPlano);

    const tbody = Utils.el('alunosTableBody');
    if (!tbody) return;

    if (alunos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)"><i class="fa-solid fa-users-slash" style="font-size:1.5rem;display:block;margin-bottom:0.5rem"></i>Nenhum aluno encontrado</td></tr>`;
      return;
    }

    tbody.innerHTML = alunos.map(a => {
      const plano = planos.find(p => p.id === a.plano);
      return `
        <tr>
          <td>
            <div class="aluno-cell">
              <div class="aluno-avatar">
                <img src="${Utils.avatarUrl(a.nome)}" alt="${a.nome}" onerror="this.style.display='none'" />
              </div>
              <div>
                <div class="aluno-name">${a.nome}</div>
                <div class="aluno-email">${a.email || '—'}</div>
              </div>
            </div>
          </td>
          <td>${a.telefone || '—'}</td>
          <td>${plano ? `<span class="badge" style="background:var(--accent-dim);color:var(--accent)">${plano.nome}</span>` : '—'}</td>
          <td>${a.objetivo || '—'}</td>
          <td>${Utils.badge(a.status)}</td>
          <td>${Utils.formatDate(a.createdAt?.slice(0,10))}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" onclick="Alunos.openModal('${a.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn wa" onclick="Alunos.sendWhatsApp('${a.id}')" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
              <button class="action-btn pay" onclick="Financeiro.openModal(null,'${a.id}')" title="Pagamento"><i class="fa-solid fa-dollar-sign"></i></button>
              <button class="action-btn del" onclick="Alunos.confirmDelete('${a.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  openModal(id = null) {
    Utils.el('alunoEditId').value = id || '';
    Utils.setHtml('modalAlunoTitle', id ? 'Editar Aluno' : 'Novo Aluno');

    // Reset tabs
    document.querySelectorAll('#modalAluno .mtab').forEach((b,i) => b.classList.toggle('active', i===0));
    document.querySelectorAll('#modalAluno .mtab-content').forEach((c,i) => c.classList.toggle('active', i===0));

    // Preenche planos
    Utils.fillPlanosSelect('aPlano');

    if (id) {
      const a = DB.findById('alunos', id);
      if (!a) return;
      Utils.setVal('aNome', a.nome);         Utils.setVal('aCpf', a.cpf);
      Utils.setVal('aTelefone', a.telefone); Utils.setVal('aWhatsapp', a.whatsapp);
      Utils.setVal('aEmail', a.email);       Utils.setVal('aNasc', a.nasc);
      Utils.setVal('aEndereco', a.endereco); Utils.setVal('aPlano', a.plano);
      Utils.setVal('aStatus', a.status);
      Utils.setVal('aPeso', a.peso);         Utils.setVal('aAltura', a.altura);
      Utils.setVal('aObjetivo', a.objetivo); Utils.setVal('aNivel', a.nivel);
      Utils.setVal('aLesoes', a.lesoes);     Utils.setVal('aHistorico', a.historico);
      Utils.setVal('aFortes', a.fortes);     Utils.setVal('aFracos', a.fracos);
      Utils.setVal('aObs', a.obs);
    } else {
      ['aNome','aCpf','aTelefone','aWhatsapp','aEmail','aNasc','aEndereco','aPlano',
       'aPeso','aAltura','aObjetivo','aLesoes','aHistorico','aFortes','aFracos','aObs']
        .forEach(id => Utils.setVal(id, ''));
      Utils.setVal('aStatus', 'ativo');
      Utils.setVal('aNivel', 'Iniciante');
    }
    Utils.openModal('modalAluno');
  },

  save() {
    const nome = Utils.val('aNome');
    if (!nome) { Utils.toast('Informe o nome do aluno!', 'warning'); return; }

    const id = Utils.val('alunoEditId');
    const data = {
      nome, cpf: Utils.val('aCpf'), telefone: Utils.val('aTelefone'),
      whatsapp: Utils.val('aWhatsapp'), email: Utils.val('aEmail'),
      nasc: Utils.val('aNasc'), endereco: Utils.val('aEndereco'),
      plano: Utils.val('aPlano'), status: Utils.val('aStatus'),
      peso: Utils.val('aPeso'), altura: Utils.val('aAltura'),
      objetivo: Utils.val('aObjetivo'), nivel: Utils.val('aNivel'),
      lesoes: Utils.val('aLesoes'), historico: Utils.val('aHistorico'),
      fortes: Utils.val('aFortes'), fracos: Utils.val('aFracos'),
      obs: Utils.val('aObs'),
    };

    if (id) {
      DB.update('alunos', id, data);
      Utils.toast('Aluno atualizado com sucesso!', 'success');
    } else {
      DB.insert('alunos', data);
      Utils.toast('Aluno cadastrado com sucesso! 🎉', 'success');
    }

    Utils.closeModal('modalAluno');
    Alunos.renderTable();
    Dashboard.updateBadges();
  },

  confirmDelete(id) {
    const a = DB.findById('alunos', id);
    Utils.confirm('Excluir Aluno', `Tem certeza que deseja excluir "${a?.nome}"? Esta ação não pode ser desfeita.`, () => {
      DB.delete('alunos', id);
      Alunos.renderTable();
      Dashboard.updateBadges();
      Utils.toast('Aluno excluído.', 'info');
    });
  },

  sendWhatsApp(id) {
    const a = DB.findById('alunos', id);
    if (!a) return;
    Router.navigate('whatsapp');
    setTimeout(() => {
      Utils.setVal('waAluno', id);
      Whatsapp.previewMsg();
    }, 300);
  }
};
