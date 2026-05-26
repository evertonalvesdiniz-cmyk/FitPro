/* ============================================================
   MÓDULO: Whatsapp — Mensagens simuladas
============================================================ */
const Whatsapp = {

  templates: {
    lembrete:  (nome, hora) => `Olá *${nome}* 👋\n\nSua aula está confirmada para *hoje às ${hora}*.\n\nEsteja pronto(a) para um ótimo treino! 💪\n\n_FitPro – Personal Trainer_`,
    cobranca:  (nome) => `Olá *${nome}*,\n\nIdentificamos que sua mensalidade está em aberto.\n\nPor favor, regularize para manter seu acesso aos treinos. 🙏\n\nQualquer dúvida, entre em contato!\n\n_FitPro – Personal Trainer_`,
    renovacao: (nome, plano) => `Olá *${nome}*! 🎉\n\nSeu plano *${plano}* foi renovado com sucesso!\n\nContinue focado nos seus objetivos. Vamos juntos! 💪🏋️\n\n_FitPro – Personal Trainer_`,
    parabens:  (nome) => `🎂 Feliz aniversário, *${nome}*!\n\nDesejamos muito saúde, disposição e que você continue evoluindo a cada dia.\n\nUm abraço do seu personal! 🎉\n\n_FitPro – Personal Trainer_`,
    livre:     () => '',
  },

  templatesMeta: [
    { key: 'lembrete',  title: 'Lembrete de Aula',      icon: 'fa-calendar-check', color: '#6366f1', desc: 'Lembra o aluno da aula programada para hoje.' },
    { key: 'cobranca',  title: 'Cobrança de Mensalidade', icon: 'fa-sack-dollar',    color: '#f59e0b', desc: 'Avisa sobre mensalidade pendente ou atrasada.' },
    { key: 'renovacao', title: 'Renovação de Plano',     icon: 'fa-rotate',         color: '#10b981', desc: 'Confirma a renovação bem-sucedida do plano.' },
    { key: 'parabens',  title: 'Parabéns / Aniversário', icon: 'fa-cake-candles',   color: '#ec4899', desc: 'Mensagem especial no aniversário do aluno.' },
    { key: 'livre',     title: 'Mensagem Livre',         icon: 'fa-pen-to-square',  color: '#14b8a6', desc: 'Digite uma mensagem personalizada.' },
  ],

  render() {
    Whatsapp.renderTemplates();
    Whatsapp.fillAlunosSelect();
    Whatsapp.renderHistory();
    Whatsapp.previewMsg();
  },

  renderTemplates() {
    const list = Utils.el('waTemplateList');
    if (!list) return;
    list.innerHTML = Whatsapp.templatesMeta.map(t => `
      <div class="wa-template-card" onclick="Utils.setVal('waTemplate','${t.key}');Whatsapp.previewMsg()">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <div style="width:38px;height:38px;border-radius:10px;background:${t.color}22;display:flex;align-items:center;justify-content:center;color:${t.color};font-size:1rem;flex-shrink:0">
            <i class="fa-solid ${t.icon}"></i>
          </div>
          <div>
            <h4>${t.title}</h4>
            <p>${t.desc}</p>
          </div>
        </div>
      </div>`).join('');
  },

  fillAlunosSelect() {
    Utils.fillAlunosSelect('waAluno', '', false);
    // Adiciona opção "Todos os alunos"
    const sel = Utils.el('waAluno');
    if (!sel) return;
    const first = sel.options[0];
    if (first?.value !== 'todos') {
      const o = document.createElement('option');
      o.value = 'todos'; o.textContent = '📢 Todos os alunos';
      sel.insertBefore(o, first);
    }
  },

  getAlunoNome() {
    const id = Utils.val('waAluno');
    if (!id || id === 'todos') return 'Aluno(a)';
    return DB.findById('alunos', id)?.nome?.split(' ')[0] || 'Aluno(a)';
  },

  previewMsg() {
    const tipo = Utils.val('waTemplate');
    const nome = Whatsapp.getAlunoNome();
    const alunoId = Utils.val('waAluno');

    // Próxima aula do aluno
    const aulas = DB.get('aulas').filter(a => a.alunoId === alunoId && a.data >= Utils.today()).sort((a,b) => a.data.localeCompare(b.data));
    const proxAula = aulas[0];

    // Plano do aluno
    const aluno = alunoId !== 'todos' ? DB.findById('alunos', alunoId) : null;
    const plano = aluno?.plano ? DB.findById('planos', aluno.plano) : null;

    let msg = '';
    const hora = proxAula?.hora || '08:00';

    if (tipo === 'livre') {
      Utils.show('waMsgLabel');
      Utils.show('waMsg');
      msg = Utils.val('waMsg') || '✏️ Digite sua mensagem personalizada acima.';
    } else {
      Utils.hide('waMsgLabel');
      Utils.hide('waMsg');
      const fn = Whatsapp.templates[tipo];
      msg = fn ? fn(nome, hora, plano?.nome || 'seu plano') : '';
    }

    const preview = Utils.el('waPreview');
    if (preview) {
      preview.innerHTML = `<div style="font-size:0.85rem;line-height:1.6;white-space:pre-wrap">${msg.replace(/\*(.*?)\*/g,'<strong>$1</strong>').replace(/_(.*?)_/g,'<em>$1</em>')}</div>
        <div style="font-size:0.72rem;opacity:0.7;text-align:right;margin-top:0.5rem">✓✓ ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>`;
    }
    Whatsapp._currentMsg = msg;
  },

  sendMsg() {
    const tipo = Utils.val('waTemplate');
    const alunoId = Utils.val('waAluno');

    if (tipo === 'livre') {
      const msg = Utils.val('waMsg');
      if (!msg) { Utils.toast('Digite a mensagem!', 'warning'); return; }
      Whatsapp._currentMsg = msg;
    }

    if (!Whatsapp._currentMsg) { Utils.toast('Selecione um aluno e template!', 'warning'); return; }

    // Simula envio
    Utils.toast('⏳ Enviando mensagem…', 'info');
    setTimeout(() => {
      // Salva no histórico
      let destinatario = 'Todos os alunos';
      if (alunoId && alunoId !== 'todos') {
        destinatario = DB.findById('alunos', alunoId)?.nome || 'Aluno';
      }

      const history = DB.get('waHistory');
      history.unshift({
        id: Utils.uid(),
        tipo,
        destinatario,
        msg: Whatsapp._currentMsg,
        enviadoEm: new Date().toISOString(),
      });
      DB.set('waHistory', history.slice(0, 50));

      Whatsapp.renderHistory();
      Utils.toast(`✅ Mensagem enviada para ${destinatario}!`, 'success');
    }, 1200);
  },

  renderHistory() {
    const history = DB.get('waHistory');
    const container = Utils.el('waHistory');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:1rem;font-size:0.82rem;color:var(--text-muted)">Nenhuma mensagem enviada ainda.</div>`;
      return;
    }

    const iconMap = { lembrete:'fa-calendar-check', cobranca:'fa-sack-dollar', renovacao:'fa-rotate', parabens:'fa-cake-candles', livre:'fa-pen-to-square' };
    container.innerHTML = history.slice(0, 15).map(h => `
      <div class="wa-history-item">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(37,211,102,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-solid ${iconMap[h.tipo]||'fa-message'}" style="color:#25d366;font-size:0.85rem"></i>
        </div>
        <div style="flex:1;overflow:hidden">
          <div style="font-weight:600;font-size:0.82rem">${h.destinatario}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.msg.split('\n')[0]}</div>
        </div>
        <span class="wa-sent-at">${new Date(h.enviadoEm).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
      </div>`).join('');
  }
};
