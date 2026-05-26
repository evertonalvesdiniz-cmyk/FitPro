/* ============================================================
   MÓDULO: Dashboard
============================================================ */
const Dashboard = {
  charts: {},

  render() {
    try { Dashboard.updateDate(); }       catch(e){ console.warn('dash:date',e); }
    try { Dashboard.updateKPIs(); }       catch(e){ console.warn('dash:kpi',e); }
    try { Dashboard.renderTodayList(); }  catch(e){ console.warn('dash:today',e); }
    try { Dashboard.renderQuickAlerts();}catch(e){ console.warn('dash:alerts',e); }
    setTimeout(() => {
      try { Dashboard.renderCharts(); }   catch(e){ console.warn('dash:charts',e); }
    }, 120);
  },

  updateDate() {
    const cfg = DB.getConfig();
    const el = document.getElementById('greetName');
    if (el) el.textContent = (cfg.nome||'Carlos').split(' ')[0];
    const d = new Date();
    const dateEl = document.getElementById('dashboardDate');
    if (dateEl) dateEl.textContent = d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  },

  updateKPIs() {
    const alunos     = DB.get('alunos');
    const pagamentos = DB.get('pagamentos');
    const aulas      = DB.get('aulas');
    const planos     = DB.get('planos');
    const today      = Utils.today();
    const mes        = Utils.currentMonth();

    const ativos = alunos.filter(a => a.status === 'ativo').length;
    Utils.setText('kpiAlunos', alunos.length);
    Utils.setText('kpiAlunosAtivos', ativos);

    const receita = pagamentos.filter(p => p.referencia===mes && p.status==='pago').reduce((s,p)=>s+(+p.valor||0),0);
    Utils.setText('kpiReceita', Utils.formatCurrency(receita));

    const inadIds   = [...new Set(pagamentos.filter(p=>p.status==='atrasado').map(p=>p.alunoId))];
    const inadValor = pagamentos.filter(p=>p.status==='atrasado').reduce((s,p)=>s+(+p.valor||0),0);
    Utils.setText('kpiInad', inadIds.length);
    const inadEl = document.getElementById('kpiInadVal');
    if (inadEl) inadEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${Utils.formatCurrency(inadValor)}`;

    const badgeInad = document.getElementById('badgeInad');
    if (badgeInad) badgeInad.textContent = inadIds.length > 0 ? inadIds.length : '';

    const aulasHoje  = aulas.filter(a => a.data===today);
    const concluidas = aulasHoje.filter(a => a.status==='concluido').length;
    Utils.setText('kpiAulasHoje', aulasHoje.length);
    Utils.setText('kpiAulasStatus', `${concluidas}/${aulasHoje.length} concluídas`);

    const pendentes = pagamentos.filter(p=>['pendente','atrasado'].includes(p.status));
    Utils.setText('kpiPendentes', pendentes.length);
    Utils.setText('kpiPlanos', planos.filter(p=>p.status==='ativo').length);

    const badgeAlunos = document.getElementById('badgeAlunos');
    if (badgeAlunos) badgeAlunos.textContent = ativos > 0 ? ativos : '';

    const bellDot = document.getElementById('bellDot');
    if (bellDot) (inadIds.length+pendentes.length) > 0 ? bellDot.classList.remove('hidden') : bellDot.classList.add('hidden');
  },

  updateBadges() { try { Dashboard.updateKPIs(); } catch(e){} },

  renderTodayList() {
    const today  = Utils.today();
    const aulas  = DB.get('aulas').filter(a=>a.data===today).sort((a,b)=>a.hora.localeCompare(b.hora));
    const alunos = DB.get('alunos');
    const el     = document.getElementById('todayList');
    if (!el) return;

    if (!aulas.length) {
      el.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:.82rem">
        <i class="fa-solid fa-calendar-xmark" style="font-size:1.4rem;display:block;margin-bottom:.5rem"></i>Nenhuma aula hoje</div>`;
      return;
    }
    const colors = {confirmado:'#6366f1',concluido:'#10b981',cancelado:'#ef4444'};
    el.innerHTML = aulas.map(au => {
      const aluno = alunos.find(a=>a.id===au.alunoId);
      return `<div class="today-item">
        <div class="today-time">${au.hora}</div>
        <div style="width:3px;height:36px;background:${colors[au.status]||'#6366f1'};border-radius:2px;flex-shrink:0"></div>
        <div class="today-info">
          <div class="today-name">${aluno?.nome||'Aluno'}</div>
          <div class="today-loc"><i class="fa-solid fa-location-dot"></i> ${au.local}${au.endereco?' — '+au.endereco:''}</div>
        </div>
        ${Utils.badge(au.status)}</div>`;
    }).join('');
  },

  renderQuickAlerts() {
    const pagamentos = DB.get('pagamentos');
    const alunos     = DB.get('alunos');
    const aulas      = DB.get('aulas');
    const today      = Utils.today();
    const alerts     = [];

    [...new Set(pagamentos.filter(p=>p.status==='atrasado').map(p=>p.alunoId))].forEach(id=>{
      const a = alunos.find(x=>x.id===id);
      if (a) alerts.push({type:'danger',icon:'fa-triangle-exclamation',msg:`<strong>${a.nome}</strong> está inadimplente`});
    });

    pagamentos.filter(p=>p.status==='pendente'&&p.vencimento).forEach(p=>{
      const diff = Math.ceil((new Date(p.vencimento+'T12:00')-new Date(today+'T12:00'))/86400000);
      if (diff>=0&&diff<=5) {
        const a = alunos.find(x=>x.id===p.alunoId);
        alerts.push({type:'warn',icon:'fa-clock',msg:`Mensalidade de <strong>${a?.nome||'Aluno'}</strong> vence em ${diff===0?'hoje':diff+' dia(s)'}`});
      }
    });

    alunos.filter(a=>a.status==='ativo').forEach(a=>{
      const ultima = aulas.filter(au=>au.alunoId===a.id&&au.status==='concluido').sort((x,y)=>y.data.localeCompare(x.data))[0];
      if (!ultima) { alerts.push({type:'info',icon:'fa-person-running',msg:`<strong>${a.nome}</strong> sem aulas registradas`}); return; }
      const diff = Math.ceil((new Date(today+'T12:00')-new Date(ultima.data+'T12:00'))/86400000);
      if (diff>7) alerts.push({type:'info',icon:'fa-person-running',msg:`<strong>${a.nome}</strong> sem aula há ${diff} dias`});
    });

    const alertsList = document.getElementById('alertsList');
    if (alertsList) alertsList.innerHTML = alerts.length
      ? alerts.map(al=>`<div class="alert-item">
          <div class="alert-icon" style="background:${al.type==='danger'?'rgba(239,68,68,.15)':al.type==='warn'?'rgba(245,158,11,.15)':'rgba(99,102,241,.15)'}">
            <i class="fa-solid ${al.icon}" style="color:${al.type==='danger'?'#ef4444':al.type==='warn'?'#f59e0b':'#6366f1'}"></i>
          </div><span>${al.msg}</span></div>`).join('')
      : '<div style="padding:1rem;font-size:.82rem;color:var(--text-muted)">Nenhum alerta 🎉</div>';

    const quickEl = document.getElementById('quickAlertsList');
    if (!quickEl) return;
    quickEl.innerHTML = !alerts.length
      ? `<div style="text-align:center;padding:1rem;color:var(--text-muted);font-size:.8rem"><i class="fa-solid fa-check-circle" style="color:#10b981"></i> Tudo em dia!</div>`
      : alerts.slice(0,5).map(al=>`<div class="quick-alert-item">
          <div class="qa-icon ${al.type}"><i class="fa-solid ${al.icon}"></i></div>
          <span style="font-size:.8rem">${al.msg}</span></div>`).join('');
  },

  renderCharts() {
    Dashboard.renderReceitaChart();
    Dashboard.renderFreqChart();
  },

  destroyChart(key) {
    if (Dashboard.charts[key]) {
      try { Dashboard.charts[key].destroy(); } catch(e){}
      Dashboard.charts[key] = null;
    }
  },

  /* Gráfico 1: Receita — ÁREA com gradiente */
  renderReceitaChart() {
    const canvas = document.getElementById('chartReceita');
    if (!canvas) return;
    Dashboard.destroyChart('receita');

    const pagamentos = DB.get('pagamentos');
    const now = new Date();
    const meses = [], valores = [];
    for (let i=5;i>=0;i--) {
      const d = new Date(now.getFullYear(),now.getMonth()-i,1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      meses.push(Utils.monthName(d.getMonth()));
      valores.push(pagamentos.filter(p=>p.referencia===key&&p.status==='pago').reduce((s,p)=>s+(+p.valor||0),0));
    }

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#10b981';
    const ctx2d = canvas.getContext('2d');
    const grad = ctx2d.createLinearGradient(0,0,0,220);
    grad.addColorStop(0, accent+'55');
    grad.addColorStop(1, accent+'04');

    Dashboard.charts.receita = new Chart(canvas, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label:'Receita', data:valores,
          borderColor:accent, borderWidth:2.5,
          backgroundColor:grad, tension:.45, fill:true,
          pointBackgroundColor:accent, pointRadius:5,
          pointHoverRadius:7, pointBorderColor:'#fff', pointBorderWidth:2,
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>Utils.formatCurrency(c.raw)},
          backgroundColor:'rgba(13,15,20,.9)',titleColor:'#e8eaf0',bodyColor:'#10b981',
          borderColor:'rgba(255,255,255,.08)',borderWidth:1,padding:10,cornerRadius:10 }},
        scales:{
          x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#7a8099',font:{size:11}}},
          y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#7a8099',font:{size:11},callback:v=>'R$'+(v/1000).toFixed(0)+'k'}}
        }
      }
    });
  },

  /* Gráfico 2: Frequência — BARRAS horizontais */
  renderFreqChart() {
    const canvas = document.getElementById('chartFreq');
    if (!canvas) return;
    Dashboard.destroyChart('freq');

    const aulas = DB.get('aulas');
    const alunos = DB.get('alunos').filter(a=>a.status==='ativo').slice(0,6);
    const labels = alunos.map(a=>a.nome.split(' ')[0]);
    const values = alunos.map(a=>aulas.filter(au=>au.alunoId===a.id&&au.status==='concluido').length);
    const colors = ['#10b981','#6366f1','#f59e0b','#ec4899','#14b8a6','#8b5cf6'];

    Dashboard.charts.freq = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets:[{
          label:'Aulas concluídas', data:values,
          backgroundColor: colors.slice(0,alunos.length).map(c=>c+'bb'),
          borderColor: colors.slice(0,alunos.length),
          borderWidth:2, borderRadius:8, borderSkipped:false,
        }]
      },
      options:{
        indexAxis:'y',
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false},
          tooltip:{backgroundColor:'rgba(13,15,20,.9)',titleColor:'#e8eaf0',bodyColor:'#a0a8c0',
            borderColor:'rgba(255,255,255,.08)',borderWidth:1,padding:10,cornerRadius:10}},
        scales:{
          x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#7a8099',font:{size:11},stepSize:1,precision:0}},
          y:{grid:{display:false},ticks:{color:'#e8eaf0',font:{size:11,weight:'600'}}}
        }
      }
    });
  }
};
