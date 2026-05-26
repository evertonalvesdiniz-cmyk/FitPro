/* ============================================================
   MÓDULO: Financeiro — Pagamentos, mensalidades, inadimplência
============================================================ */
const Financeiro = {

  render() {
    Financeiro.updateSummary();
    Utils.fillMesesSelect('finFiltroMes');
    Financeiro.renderTable();
  },

  updateSummary() {
    const pagamentos = DB.get('pagamentos');
    const mes = Utils.currentMonth();
    const recebido = pagamentos.filter(p => p.referencia === mes && p.status === 'pago').reduce((s,p) => s + (+p.valor||0), 0);
    const pendente = pagamentos.filter(p => p.status === 'pendente').reduce((s,p) => s + (+p.valor||0), 0);
    const atrasado = pagamentos.filter(p => p.status === 'atrasado').reduce((s,p) => s + (+p.valor||0), 0);
    const total = pagamentos.filter(p => p.status === 'pago').reduce((s,p) => s + (+p.valor||0), 0);

    Utils.setText('finRecebido', Utils.formatCurrency(recebido));
    Utils.setText('finPendente', Utils.formatCurrency(pendente));
    Utils.setText('finAtrasado', Utils.formatCurrency(atrasado));
    Utils.setText('finTotal', Utils.formatCurrency(total));
  },

  renderTable() {
    const search = Utils.val('finSearch').toLowerCase();
    const filtroStatus = Utils.val('finFiltroStatus');
    const filtroMes = Utils.val('finFiltroMes');
    const alunos = DB.get('alunos');
    const planos = DB.get('planos');
    let pagamentos = DB.get('pagamentos');

    if (search) {
      const matchIds = alunos.filter(a => a.nome.toLowerCase().includes(search)).map(a => a.id);
      pagamentos = pagamentos.filter(p => matchIds.includes(p.alunoId));
    }
    if (filtroStatus) pagamentos = pagamentos.filter(p => p.status === filtroStatus);
    if (filtroMes) pagamentos = pagamentos.filter(p => p.referencia === filtroMes);

    pagamentos.sort((a,b) => b.vencimento?.localeCompare(a.vencimento||''));

    const tbody = Utils.el('finTableBody');
    if (!tbody) return;

    if (pagamentos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">Nenhum pagamento encontrado</td></tr>`;
      return;
    }

    tbody.innerHTML = pagamentos.map(p => {
      const aluno = alunos.find(a => a.id === p.alunoId);
      const plano = planos.find(pl => pl.id === p.planoId);
      return `
        <tr>
          <td>
            <div class="aluno-cell">
              <div class="aluno-avatar"><img src="${Utils.avatarUrl(aluno?.nome||'')}" alt="" /></div>
              <div><div class="aluno-name">${aluno?.nome||'—'}</div></div>
            </div>
          </td>
          <td>${plano?.nome||'—'}</td>
          <td>${Utils.formatDate(p.vencimento)}</td>
          <td><strong>${Utils.formatCurrency(p.valor)}</strong></td>
          <td>${Utils.payIcon(p.forma)}</td>
          <td>${Utils.badge(p.status)}</td>
          <td>
            <div class="action-btns">
              ${p.status !== 'pago' ? `<button class="action-btn pay" onclick="Financeiro.markPaid('${p.id}')" title="Marcar como pago"><i class="fa-solid fa-check"></i></button>` : ''}
              <button class="action-btn edit" onclick="Financeiro.openModal('${p.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn wa" onclick="Financeiro.sendCobranca('${p.id}')" title="Cobrar via WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
              <button class="action-btn del" onclick="Financeiro.confirmDelete('${p.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  openModal(id = null, alunoId = null) {
    Utils.el('payEditId').value = id || '';
    Utils.setHtml('modalPayTitle', id ? 'Editar Pagamento' : 'Registrar Pagamento');
    Utils.fillAlunosSelect('payAluno', alunoId || '');
    Utils.fillPlanosSelect('payPlano');

    if (id) {
      const p = DB.findById('pagamentos', id);
      if (!p) return;
      Utils.setVal('payAluno', p.alunoId);
      Utils.setVal('payPlano', p.planoId);
      Utils.setVal('payValor', p.valor);
      Utils.setVal('payVenc', p.vencimento);
      Utils.setVal('payData', p.dataPagamento);
      Utils.setVal('payForma', p.forma);
      Utils.setVal('payStatus', p.status);
      Utils.setVal('payRef', p.referencia);
      Utils.setVal('payObs', p.obs);
    } else {
      const today = Utils.today();
      const mes = today.slice(0,7);
      Utils.setVal('payVenc', today);
      Utils.setVal('payData', today);
      Utils.setVal('payRef', mes);
      Utils.setVal('payForma', 'pix');
      Utils.setVal('payStatus', 'pago');
      Utils.setVal('payObs', '');
      Utils.setVal('payValor', '');

      if (alunoId) {
        setTimeout(() => Financeiro.fillPlanoFromAluno(), 100);
      }
    }
    Utils.openModal('modalPayment');
  },

  fillPlanoFromAluno() {
    const alunoId = Utils.val('payAluno');
    if (!alunoId) return;
    const aluno = DB.findById('alunos', alunoId);
    if (aluno?.plano) {
      Utils.setVal('payPlano', aluno.plano);
      Financeiro.fillValorFromPlano();
    }
  },

  fillValorFromPlano() {
    const planoId = Utils.val('payPlano');
    if (!planoId) return;
    const plano = DB.findById('planos', planoId);
    if (plano?.valor) Utils.setVal('payValor', plano.valor);
  },

  save() {
    const alunoId = Utils.val('payAluno');
    const valor = Utils.val('payValor');
    if (!alunoId || !valor) { Utils.toast('Informe o aluno e o valor!', 'warning'); return; }

    const id = Utils.val('payEditId');
    const data = {
      alunoId, planoId: Utils.val('payPlano'),
      valor: +valor, vencimento: Utils.val('payVenc'),
      dataPagamento: Utils.val('payData') || null,
      forma: Utils.val('payForma'),
      status: Utils.val('payStatus'),
      referencia: Utils.val('payRef'),
      obs: Utils.val('payObs'),
    };

    if (id) {
      DB.update('pagamentos', id, data);
      Utils.toast('Pagamento atualizado!', 'success');
    } else {
      DB.insert('pagamentos', data);
      Utils.toast('Pagamento registrado!', 'success');
    }

    Utils.closeModal('modalPayment');
    Financeiro.render();
    Dashboard.updateBadges();
  },

  markPaid(id) {
    DB.update('pagamentos', id, {
      status: 'pago',
      dataPagamento: Utils.today(),
    });
    Financeiro.render();
    Dashboard.updateBadges();
    Utils.toast('Pagamento marcado como pago! ✅', 'success');
  },

  confirmDelete(id) {
    Utils.confirm('Excluir Pagamento', 'Tem certeza que deseja excluir este pagamento?', () => {
      DB.delete('pagamentos', id);
      Financeiro.render();
      Dashboard.updateBadges();
      Utils.toast('Pagamento excluído.', 'info');
    });
  },

  gerarMensalidades() {
    const alunos = DB.get('alunos').filter(a => a.status === 'ativo' && a.plano);
    const pagamentos = DB.get('pagamentos');
    const mes = Utils.currentMonth();
    let gerados = 0;

    alunos.forEach(a => {
      const jaExiste = pagamentos.find(p => p.alunoId === a.id && p.referencia === mes);
      if (jaExiste) return;
      const plano = DB.findById('planos', a.plano);
      if (!plano) return;
      const venc = `${mes}-10`;
      DB.insert('pagamentos', {
        alunoId: a.id, planoId: a.plano,
        valor: plano.valor, vencimento: venc,
        dataPagamento: null, forma: 'pix',
        status: 'pendente', referencia: mes, obs: 'Gerado automaticamente',
      });
      gerados++;
    });

    if (gerados > 0) {
      Utils.toast(`${gerados} mensalidades geradas para ${mes}!`, 'success');
      Financeiro.render();
    } else {
      Utils.toast('Todas as mensalidades deste mês já foram geradas.', 'info');
    }
  },

  sendCobranca(id) {
    const p = DB.findById('pagamentos', id);
    if (!p) return;
    Router.navigate('whatsapp');
    setTimeout(() => {
      Utils.setVal('waAluno', p.alunoId);
      Utils.setVal('waTemplate', 'cobranca');
      Whatsapp.previewMsg();
    }, 300);
  }
};
