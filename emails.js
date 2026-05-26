/* ============================================================
   MÓDULO: Emails — Templates e histórico de e-mails
============================================================ */
const Emails = {

  templates: {
    boas_vindas: {
      titulo: 'Boas-Vindas ao FitPro! 🎉',
      assunto: 'Bem-vindo(a) aos nossos treinos!',
      cor: '#10b981',
      icone: '🎉',
      corpo: (nome, personal) => `
        <h2 style="color:#10b981;margin-bottom:1rem">Bem-vindo(a), ${nome}!</h2>
        <p>É com enorme satisfação que recebemos você como nosso novo aluno(a).</p>
        <p style="margin-top:0.75rem">Estou animado(a) para acompanhar sua jornada de transformação e te ajudar a alcançar todos os seus objetivos!</p>
        <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:1rem;margin:1.25rem 0;border-radius:0 8px 8px 0">
          <strong>Próximos passos:</strong>
          <ul style="margin-top:0.5rem;padding-left:1.25rem">
            <li>Compareça à sua primeira avaliação física</li>
            <li>Confira a agenda de treinos</li>
            <li>Mantenha-se hidratado(a) e descansado(a)</li>
          </ul>
        </div>
        <p>Qualquer dúvida, estou à disposição! 💪</p>
        <p style="margin-top:1rem">Com carinho,<br/><strong>${personal}</strong></p>`,
    },
    confirmacao: {
      titulo: 'Pagamento Confirmado ✅',
      assunto: 'Confirmação de pagamento recebida',
      cor: '#6366f1',
      icone: '✅',
      corpo: (nome, personal) => `
        <h2 style="color:#6366f1;margin-bottom:1rem">Pagamento Confirmado!</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p style="margin-top:0.75rem">Seu pagamento foi recebido e confirmado com sucesso. 🎉</p>
        <div style="background:#f5f3ff;border-left:4px solid #6366f1;padding:1rem;margin:1.25rem 0;border-radius:0 8px 8px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem"><span>Status:</span><strong style="color:#10b981">✅ Pago</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem"><span>Data:</span><strong>${new Date().toLocaleDateString('pt-BR')}</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Próximo vencimento:</span><strong>30 dias</strong></div>
        </div>
        <p>Continue focado(a) nos seus objetivos! Os treinos estão te esperando 💪</p>
        <p style="margin-top:1rem">Abraços,<br/><strong>${personal}</strong></p>`,
    },
    vencimento: {
      titulo: 'Mensalidade Vencendo em Breve ⏰',
      assunto: 'Lembrete: sua mensalidade vence em breve',
      cor: '#f59e0b',
      icone: '⏰',
      corpo: (nome, personal) => `
        <h2 style="color:#f59e0b;margin-bottom:1rem">Lembrete de Vencimento</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p style="margin-top:0.75rem">Este é um lembrete amigável de que sua mensalidade vence em breve.</p>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:1rem;margin:1.25rem 0;border-radius:0 8px 8px 0">
          <p><strong>⚠️ Atenção:</strong> Mantenha seu plano em dia para não perder nenhum treino!</p>
        </div>
        <p>Para efetuar o pagamento, utilize uma das formas disponíveis: <strong>Pix, Dinheiro, Cartão ou Transferência</strong>.</p>
        <p style="margin-top:1rem">Qualquer dúvida, me chame! 😊<br/><strong>${personal}</strong></p>`,
    },
    renovacao: {
      titulo: 'Plano Renovado com Sucesso 🔄',
      assunto: 'Seu plano foi renovado!',
      cor: '#14b8a6',
      icone: '🔄',
      corpo: (nome, personal) => `
        <h2 style="color:#14b8a6;margin-bottom:1rem">Plano Renovado!</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p style="margin-top:0.75rem">Ótimas notícias! Seu plano de treinos foi renovado com sucesso.</p>
        <div style="background:#f0fdfa;border-left:4px solid #14b8a6;padding:1rem;margin:1.25rem 0;border-radius:0 8px 8px 0">
          <p><strong>🎯 Continue focado(a)!</strong> A consistência é o segredo do sucesso. Você está no caminho certo!</p>
        </div>
        <p>Nos vemos nos próximos treinos. Bora evoluir! 🚀</p>
        <p style="margin-top:1rem">Com motivação,<br/><strong>${personal}</strong></p>`,
    },
    cancelamento: {
      titulo: 'Cancelamento de Plano',
      assunto: 'Informações sobre cancelamento do seu plano',
      cor: '#ef4444',
      icone: '😢',
      corpo: (nome, personal) => `
        <h2 style="color:#ef4444;margin-bottom:1rem">Sobre seu Plano</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p style="margin-top:0.75rem">Sentimos muito em informar que seu plano foi cancelado conforme solicitado.</p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:1rem;margin:1.25rem 0;border-radius:0 8px 8px 0">
          <p>Você poderá reativar seu plano a qualquer momento. Estaremos aqui quando quiser retomar! 💪</p>
        </div>
        <p>Foi um prazer acompanhar sua jornada. Obrigado(a) por confiar no meu trabalho!</p>
        <p style="margin-top:1rem">Até breve,<br/><strong>${personal}</strong></p>`,
    },
  },

  render() {
    Emails.renderTemplateList();
    Emails.renderHistory();
  },

  renderTemplateList() {
    const container = Utils.el('emailTemplateList');
    if (!container) return;
    const list = Object.entries(Emails.templates);
    container.innerHTML = list.map(([key, t]) => `
      <div class="email-template-item" onclick="Emails.openModal('${key}')">
        <div class="email-template-icon" style="background:${t.cor}22;color:${t.cor}">
          <span style="font-size:1.3rem">${t.icone}</span>
        </div>
        <div>
          <div style="font-weight:700;font-size:0.875rem">${t.titulo}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem">${t.assunto}</div>
        </div>
        <i class="fa-solid fa-chevron-right" style="color:var(--text-dim);margin-left:auto"></i>
      </div>`).join('');
  },

  renderHistory() {
    const history = DB.get('emailHistory');
    const container = Utils.el('emailHistory');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.85rem"><i class="fa-solid fa-envelope-open" style="font-size:1.5rem;display:block;margin-bottom:0.5rem"></i>Nenhum e-mail enviado ainda.</div>`;
      return;
    }

    container.innerHTML = history.slice(0, 20).map(h => {
      const t = Emails.templates[h.tipo] || {};
      return `
        <div class="email-history-item">
          <div style="width:40px;height:40px;border-radius:10px;background:${(t.cor||'#6366f1')}22;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">${t.icone||'📧'}</div>
          <div style="flex:1;overflow:hidden">
            <div style="font-weight:700;font-size:0.85rem">${h.destinatario}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.assunto}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:0.75rem;color:var(--text-muted)">${new Date(h.enviadoEm).toLocaleDateString('pt-BR')}</div>
            <span style="font-size:0.72rem;color:#10b981"><i class="fa-solid fa-check-double"></i> Enviado</span>
          </div>
        </div>`;
    }).join('');
  },

  openModal(templateKey = null) {
    Utils.fillAlunosSelect('emailAluno', '');
    if (templateKey) Utils.setVal('emailTemplate', templateKey);
    Emails.previewTemplate();
    Utils.openModal('modalEmail');
  },

  previewTemplate() {
    const tipo = Utils.val('emailTemplate');
    const alunoId = Utils.val('emailAluno');
    const aluno = alunoId ? DB.findById('alunos', alunoId) : null;
    const nome = aluno?.nome || 'Aluno(a)';
    const cfg = DB.getConfig();
    const personal = cfg.nome || 'Seu Personal';
    const t = Emails.templates[tipo] || Emails.templates.boas_vindas;

    Utils.setVal('emailAssunto', t.assunto);

    const preview = Utils.el('emailPreviewWrap');
    if (preview) {
      preview.innerHTML = `
        <div style="background:#fff;color:#1a1d2e;border-radius:12px;overflow:hidden;font-family:'DM Sans',sans-serif">
          <div style="background:${t.cor};padding:2rem;text-align:center;color:#fff">
            <div style="font-size:2.5rem;margin-bottom:0.5rem">${t.icone}</div>
            <div style="font-size:1.2rem;font-weight:800;font-family:'Syne',sans-serif">FitPro</div>
            <div style="font-size:0.85rem;opacity:0.85">Sistema de Personal Trainer</div>
          </div>
          <div style="padding:1.5rem 2rem;font-size:0.875rem;line-height:1.7">
            ${t.corpo(nome, personal)}
          </div>
          <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;font-size:0.75rem;color:#888;border-top:1px solid #eee">
            © ${new Date().getFullYear()} FitPro • Este é um e-mail simulado (sistema de gestão)
          </div>
        </div>`;
    }
  },

  send() {
    const alunoId = Utils.val('emailAluno');
    if (!alunoId) { Utils.toast('Selecione o destinatário!', 'warning'); return; }

    const tipo = Utils.val('emailTemplate');
    const assunto = Utils.val('emailAssunto');
    const aluno = DB.findById('alunos', alunoId);

    Utils.toast('📤 Enviando e-mail…', 'info');
    setTimeout(() => {
      const history = DB.get('emailHistory');
      history.unshift({
        id: Utils.uid(),
        tipo,
        destinatario: aluno?.nome || 'Aluno',
        email: aluno?.email || '',
        assunto,
        enviadoEm: new Date().toISOString(),
      });
      DB.set('emailHistory', history.slice(0, 50));

      Utils.closeModal('modalEmail');
      Emails.renderHistory();
      Utils.toast(`✅ E-mail enviado para ${aluno?.nome}!`, 'success');
    }, 1500);
  }
};
