/* ============================================================
   MÓDULO: DB — Banco de Dados (LocalStorage)
   CRUD genérico + dados iniciais mockados
============================================================ */
const DB = {

  /* ── Chaves do LocalStorage ── */
  KEYS: {
    alunos: 'fp_alunos',
    planos: 'fp_planos',
    aulas: 'fp_aulas',
    pagamentos: 'fp_pagamentos',
    waHistory: 'fp_wa_history',
    emailHistory: 'fp_email_history',
    config: 'fp_config',
    session: 'fp_session',
  },

  /* ── Ler coleção ── */
  get(collection) {
    try {
      return JSON.parse(localStorage.getItem(DB.KEYS[collection]) || '[]');
    } catch { return []; }
  },

  /* ── Salvar coleção ── */
  set(collection, data) {
    localStorage.setItem(DB.KEYS[collection], JSON.stringify(data));
  },

  /* ── Inserir item ── */
  insert(collection, item) {
    const data = DB.get(collection);
    item.id = item.id || Utils.uid();
    item.createdAt = item.createdAt || new Date().toISOString();
    data.push(item);
    DB.set(collection, data);
    return item;
  },

  /* ── Atualizar item ── */
  update(collection, id, changes) {
    const data = DB.get(collection).map(item =>
      item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
    );
    DB.set(collection, data);
  },

  /* ── Excluir item ── */
  delete(collection, id) {
    DB.set(collection, DB.get(collection).filter(item => item.id !== id));
  },

  /* ── Buscar por id ── */
  findById(collection, id) {
    return DB.get(collection).find(item => item.id === id) || null;
  },

  /* ── Config do personal ── */
  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(DB.KEYS.config) || 'null') || DB.defaultConfig();
    } catch { return DB.defaultConfig(); }
  },

  setConfig(cfg) {
    localStorage.setItem(DB.KEYS.config, JSON.stringify(cfg));
  },

  defaultConfig() {
    return {
      nome: 'Carlos Silva',
      telefone: '(44) 99999-9999',
      email: 'admin@fitpro.com',
      especialidade: 'Personal Trainer CREF',
      theme: 'dark',
      accent: '#10b981',
      horarios: {
        segunda: { ativo: true, inicio: '07:00', fim: '21:00' },
        terca:   { ativo: true, inicio: '07:00', fim: '21:00' },
        quarta:  { ativo: true, inicio: '07:00', fim: '21:00' },
        quinta:  { ativo: true, inicio: '07:00', fim: '21:00' },
        sexta:   { ativo: true, inicio: '07:00', fim: '21:00' },
        sabado:  { ativo: true, inicio: '08:00', fim: '14:00' },
        domingo: { ativo: false, inicio: '—', fim: '—' },
      }
    };
  },

  /* ══════════════════════════════════════
     SEED — Dados mockados iniciais
  ══════════════════════════════════════ */
  seed() {
    // Só cria se ainda não existe nada
    if (DB.get('planos').length > 0) return;

    /* PLANOS */
    const planos = [
      { id: 'p1', nome: '2x Semana', valor: 250, frequencia: 2, duracao: 1, tipo: 'mensal', status: 'ativo', descricao: 'Treinos 2x por semana', createdAt: new Date().toISOString() },
      { id: 'p2', nome: '3x Semana', valor: 350, frequencia: 3, duracao: 1, tipo: 'mensal', status: 'ativo', descricao: 'Treinos 3x por semana', createdAt: new Date().toISOString() },
      { id: 'p3', nome: 'Premium 5x', valor: 550, frequencia: 5, duracao: 1, tipo: 'mensal', status: 'ativo', descricao: 'Personal diário + plano nutricional', createdAt: new Date().toISOString() },
      { id: 'p4', nome: 'Trimestral 3x', valor: 900, frequencia: 3, duracao: 3, tipo: 'trimestral', status: 'ativo', descricao: 'Desconto no trimestre', createdAt: new Date().toISOString() },
    ];
    DB.set('planos', planos);

    /* ALUNOS */
    const alunos = [
      { id: 'a1', nome: 'João Pedro Santos', cpf: '111.111.111-11', telefone: '(44) 99111-1111', whatsapp: '(44) 99111-1111', email: 'joao@email.com', nasc: '1990-05-15', endereco: 'Rua das Flores, 100, Maringá', plano: 'p2', status: 'ativo', peso: 82, altura: 178, objetivo: 'Ganho de massa', nivel: 'Intermediário', lesoes: 'Nenhuma', historico: '', fortes: 'Disciplina, força', fracos: 'Cardio', obs: 'Treina de manhã', createdAt: '2025-01-10T10:00:00.000Z' },
      { id: 'a2', nome: 'Maria Clara Oliveira', cpf: '222.222.222-22', telefone: '(44) 99222-2222', whatsapp: '(44) 99222-2222', email: 'maria@email.com', nasc: '1995-08-22', endereco: 'Av. Brasil, 500, Maringá', plano: 'p1', status: 'ativo', peso: 62, altura: 165, objetivo: 'Emagrecimento', nivel: 'Iniciante', lesoes: 'Lombalgia leve', historico: 'Hipertensão controlada', fortes: 'Motivação', fracos: 'Força', obs: 'Prefere tarde', createdAt: '2025-01-15T10:00:00.000Z' },
      { id: 'a3', nome: 'Pedro Alves Costa', cpf: '333.333.333-33', telefone: '(44) 99333-3333', whatsapp: '(44) 99333-3333', email: 'pedro@email.com', nasc: '1988-03-10', endereco: 'Rua Paraná, 200, Maringá', plano: 'p3', status: 'ativo', peso: 90, altura: 182, objetivo: 'Performance', nivel: 'Avançado', lesoes: 'Joelho direito — cirurgia 2022', historico: '', fortes: 'Resistência, técnica', fracos: 'Flexibilidade', obs: 'Atleta recreativo', createdAt: '2025-02-01T10:00:00.000Z' },
      { id: 'a4', nome: 'Ana Beatriz Lima', cpf: '444.444.444-44', telefone: '(44) 99444-4444', whatsapp: '(44) 99444-4444', email: 'ana@email.com', nasc: '1997-11-30', endereco: 'Rua XV, 45, Maringá', plano: 'p2', status: 'ativo', peso: 58, altura: 162, objetivo: 'Condicionamento', nivel: 'Iniciante', lesoes: '', historico: '', fortes: 'Consistência', fracos: 'Força superior', obs: '', createdAt: '2025-02-15T10:00:00.000Z' },
      { id: 'a5', nome: 'Lucas Ferreira Dias', cpf: '555.555.555-55', telefone: '(44) 99555-5555', whatsapp: '(44) 99555-5555', email: 'lucas@email.com', nasc: '1992-07-04', endereco: 'Av. Colombo, 800, Maringá', plano: 'p4', status: 'ativo', peso: 75, altura: 175, objetivo: 'Saúde e qualidade de vida', nivel: 'Intermediário', lesoes: '', historico: 'Diabetes tipo 2', fortes: 'Flexibilidade', fracos: 'Pontualidade', obs: 'Monitorar glicemia', createdAt: '2025-03-01T10:00:00.000Z' },
      { id: 'a6', nome: 'Fernanda Torres', cpf: '666.666.666-66', telefone: '(44) 99666-6666', whatsapp: '(44) 99666-6666', email: 'fernanda@email.com', nasc: '2000-01-20', endereco: 'Rua Dom Pedro, 30, Maringá', plano: 'p1', status: 'inativo', peso: 55, altura: 160, objetivo: 'Emagrecimento', nivel: 'Iniciante', lesoes: '', historico: '', fortes: '', fracos: '', obs: 'Pausou em abril', createdAt: '2025-03-10T10:00:00.000Z' },
    ];
    DB.set('alunos', alunos);

    /* PAGAMENTOS */
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const mesAnterior = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}` || `${now.getFullYear() - 1}-12`;

    const pagamentos = [
      { id: 'pg1', alunoId: 'a1', planoId: 'p2', valor: 350, vencimento: `${mes}-05`, dataPagamento: `${mes}-03`, forma: 'pix', status: 'pago', referencia: mes, obs: '', createdAt: new Date().toISOString() },
      { id: 'pg2', alunoId: 'a2', planoId: 'p1', valor: 250, vencimento: `${mes}-10`, dataPagamento: null, forma: 'dinheiro', status: 'pendente', referencia: mes, obs: '', createdAt: new Date().toISOString() },
      { id: 'pg3', alunoId: 'a3', planoId: 'p3', valor: 550, vencimento: `${mes}-01`, dataPagamento: `${mes}-01`, forma: 'cartao', status: 'pago', referencia: mes, obs: '', createdAt: new Date().toISOString() },
      { id: 'pg4', alunoId: 'a4', planoId: 'p2', valor: 350, vencimento: `${mes}-15`, dataPagamento: null, forma: 'pix', status: 'atrasado', referencia: mes, obs: 'Cobrar', createdAt: new Date().toISOString() },
      { id: 'pg5', alunoId: 'a5', planoId: 'p4', valor: 900, vencimento: `${mes}-20`, dataPagamento: `${mes}-18`, forma: 'transferencia', status: 'pago', referencia: mes, obs: '', createdAt: new Date().toISOString() },
      { id: 'pg6', alunoId: 'a1', planoId: 'p2', valor: 350, vencimento: `2025-04-05`, dataPagamento: `2025-04-04`, forma: 'pix', status: 'pago', referencia: '2025-04', obs: '', createdAt: new Date().toISOString() },
      { id: 'pg7', alunoId: 'a3', planoId: 'p3', valor: 550, vencimento: `2025-04-01`, dataPagamento: `2025-04-01`, forma: 'cartao', status: 'pago', referencia: '2025-04', obs: '', createdAt: new Date().toISOString() },
      { id: 'pg8', alunoId: 'a2', planoId: 'p1', valor: 250, vencimento: `2025-03-10`, dataPagamento: `2025-03-09`, forma: 'dinheiro', status: 'pago', referencia: '2025-03', obs: '', createdAt: new Date().toISOString() },
      { id: 'pg9', alunoId: 'a4', planoId: 'p2', valor: 350, vencimento: `2025-03-15`, dataPagamento: `2025-03-14`, forma: 'pix', status: 'pago', referencia: '2025-03', obs: '', createdAt: new Date().toISOString() },
    ];
    DB.set('pagamentos', pagamentos);

    /* AULAS */
    const todayStr = Utils.today();
    const aulas = [
      { id: 'au1', alunoId: 'a1', data: todayStr, hora: '07:00', duracao: 60, local: 'Academia', endereco: 'Av. Brasil, 100', status: 'confirmado', obs: 'Treino A - Peito e Tríceps', createdAt: new Date().toISOString() },
      { id: 'au2', alunoId: 'a2', data: todayStr, hora: '09:00', duracao: 60, local: 'Ao Ar Livre', endereco: 'Parque do Ingá', status: 'confirmado', obs: 'Circuito cardio', createdAt: new Date().toISOString() },
      { id: 'au3', alunoId: 'a3', data: todayStr, hora: '11:00', duracao: 60, local: 'Academia', endereco: 'Av. Brasil, 100', status: 'concluido', obs: 'Treino de pernas', createdAt: new Date().toISOString() },
      { id: 'au4', alunoId: 'a4', data: todayStr, hora: '18:00', duracao: 60, local: 'Academia', endereco: 'Av. Brasil, 100', status: 'confirmado', obs: 'Treino B', createdAt: new Date().toISOString() },
      { id: 'au5', alunoId: 'a5', data: todayStr, hora: '20:00', duracao: 60, local: 'Domicílio', endereco: 'Av. Colombo, 800', status: 'confirmado', obs: '', createdAt: new Date().toISOString() },
    ];
    // Algumas aulas nos próximos dias
    for (let i = 1; i <= 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      const aIds = ['a1','a2','a3','a4','a5'];
      aIds.slice(0, (i % 3) + 2).forEach((aId, idx) => {
        aulas.push({
          id: Utils.uid(),
          alunoId: aId,
          data: ds,
          hora: `${String(7 + idx * 2).padStart(2,'0')}:00`,
          duracao: 60,
          local: idx % 2 === 0 ? 'Academia' : 'Ao Ar Livre',
          endereco: idx % 2 === 0 ? 'Av. Brasil, 100' : 'Parque do Ingá',
          status: 'confirmado',
          obs: '',
          createdAt: new Date().toISOString()
        });
      });
    }
    DB.set('aulas', aulas);

    /* HISTÓRICO WA + EMAIL */
    DB.set('waHistory', []);
    DB.set('emailHistory', []);
  }
};
