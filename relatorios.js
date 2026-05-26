/* ============================================================
   MÓDULO: Relatórios — 6 gráficos com tipos variados
============================================================ */
const Relatorios = {
  charts: {},

  render() {
    Object.keys(Relatorios.charts).forEach(k=>{ try{Relatorios.charts[k]?.destroy();}catch(e){} Relatorios.charts[k]=null; });
    setTimeout(()=>{
      try{Relatorios.renderReceitaAnual();}catch(e){console.warn('rel:receita',e);}
      try{Relatorios.renderStatusPag();}catch(e){console.warn('rel:status',e);}
      try{Relatorios.renderAlunosPorPlano();}catch(e){console.warn('rel:planos',e);}
      try{Relatorios.renderFreqSemanal();}catch(e){console.warn('rel:freq',e);}
      try{Relatorios.renderCancelamentos();}catch(e){console.warn('rel:cancel',e);}
      try{Relatorios.renderCrescimento();}catch(e){console.warn('rel:cresce',e);}
    }, 100);
  },

  d() {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return { g: dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)', t: dark?'#7a8099':'#64748b' };
  },

  mk(id, config) {
    const cv = document.getElementById(id);
    if (!cv) return null;
    if (Relatorios.charts[id]) { try{Relatorios.charts[id].destroy();}catch(e){} }
    Relatorios.charts[id] = new Chart(cv, config);
    return Relatorios.charts[id];
  },

  tooltipDefaults() {
    return { backgroundColor:'rgba(13,15,20,.92)', titleColor:'#e8eaf0', bodyColor:'#a0a8c0', borderColor:'rgba(255,255,255,.07)', borderWidth:1, padding:10, cornerRadius:10 };
  },

  /* 1. RECEITA ANUAL — Barras agrupadas com linha de meta */
  renderReceitaAnual() {
    const pags = DB.get('pagamentos');
    const year = new Date().getFullYear();
    const {g,t} = Relatorios.d();
    const meses = Array.from({length:12},(_,i)=>Utils.monthName(i));

    const receitas = Array.from({length:12},(_,i)=>{
      const key=`${year}-${String(i+1).padStart(2,'0')}`;
      return pags.filter(p=>p.referencia===key&&p.status==='pago').reduce((s,p)=>s+(+p.valor||0),0);
    });
    const inad = Array.from({length:12},(_,i)=>{
      const key=`${year}-${String(i+1).padStart(2,'0')}`;
      return pags.filter(p=>p.referencia===key&&p.status==='atrasado').reduce((s,p)=>s+(+p.valor||0),0);
    });
    const meta = Array(12).fill(Math.max(...receitas,500)*1.1); // linha de meta

    Relatorios.mk('chartReceitaAnual', {
      type:'bar',
      data:{ labels:meses, datasets:[
        { label:'Receita', data:receitas, backgroundColor:'rgba(16,185,129,.65)', borderColor:'#10b981', borderWidth:0, borderRadius:7, borderSkipped:false },
        { label:'Inadimplência', data:inad, backgroundColor:'rgba(239,68,68,.55)', borderColor:'#ef4444', borderWidth:0, borderRadius:7, borderSkipped:false },
        { label:'Meta', data:meta, type:'line', borderColor:'#f59e0b', borderDash:[6,4], borderWidth:2, pointRadius:0, fill:false, tension:0 },
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{labels:{color:t,boxWidth:12,padding:16}}, tooltip:{...Relatorios.tooltipDefaults(), callbacks:{label:c=>` ${c.dataset.label}: ${Utils.formatCurrency(c.raw)}`}} },
        scales:{ x:{grid:{color:g},ticks:{color:t}}, y:{grid:{color:g},ticks:{color:t,callback:v=>'R$'+(v/1000).toFixed(1)+'k'}} }
      }
    });
  },

  /* 2. STATUS PAGAMENTOS — Doughnut com label central */
  renderStatusPag() {
    const pags = DB.get('pagamentos');
    const {t} = Relatorios.d();
    const total = pags.length;
    const pago  = pags.filter(p=>p.status==='pago').length;

    Relatorios.mk('chartStatusPag', {
      type:'doughnut',
      data:{ labels:['Pago','Pendente','Atrasado','Cancelado'],
        datasets:[{ data:[pago,pags.filter(p=>p.status==='pendente').length,pags.filter(p=>p.status==='atrasado').length,pags.filter(p=>p.status==='cancelado').length],
          backgroundColor:['#10b981','#f59e0b','#ef4444','#64748b'],
          borderWidth:0, hoverOffset:10, borderRadius:5 }]
      },
      plugins:[{
        id:'centerText',
        afterDraw(chart){
          const {ctx,chartArea:{left,right,top,bottom}}=chart;
          const cx=(left+right)/2, cy=(top+bottom)/2;
          ctx.save();
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle='#e8eaf0'; ctx.font='bold 22px Syne,sans-serif';
          ctx.fillText(total>0?Math.round(pago/total*100)+'%':'0%', cx, cy-8);
          ctx.fillStyle='#7a8099'; ctx.font='11px DM Sans,sans-serif';
          ctx.fillText('pagos', cx, cy+12);
          ctx.restore();
        }
      }],
      options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
        plugins:{ legend:{position:'bottom',labels:{color:t,padding:14,boxWidth:10,boxHeight:10,borderRadius:3}},
          tooltip:{...Relatorios.tooltipDefaults()} }
      }
    });
  },

  /* 3. ALUNOS POR PLANO — Polar Area */
  renderAlunosPorPlano() {
    const alunos = DB.get('alunos').filter(a=>a.status==='ativo');
    const planos = DB.get('planos');
    const {t} = Relatorios.d();
    const labels = planos.map(p=>p.nome);
    const values = planos.map(p=>alunos.filter(a=>a.plano===p.id).length);
    const colors = ['#10b981','#6366f1','#f59e0b','#ec4899','#14b8a6','#8b5cf6'];

    Relatorios.mk('chartAlunosPorPlano', {
      type:'polarArea',
      data:{ labels, datasets:[{ data:values,
        backgroundColor:colors.slice(0,planos.length).map(c=>c+'aa'),
        borderColor:colors.slice(0,planos.length), borderWidth:2 }]
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{position:'bottom',labels:{color:t,padding:12,boxWidth:10}},
          tooltip:{...Relatorios.tooltipDefaults()} },
        scales:{ r:{grid:{color:'rgba(255,255,255,0.06)'},ticks:{display:false}} }
      }
    });
  },

  /* 4. FREQUÊNCIA SEMANAL — Linha com pontos e gradiente */
  renderFreqSemanal() {
    const aulas = DB.get('aulas');
    const {g,t} = Relatorios.d();
    const semanas=[], counts=[];
    for (let i=7;i>=0;i--) {
      const d=new Date(); d.setDate(d.getDate()-i*7);
      const dow=d.getDay();
      const start=new Date(d); start.setDate(d.getDate()-dow);
      const end=new Date(start); end.setDate(start.getDate()+6);
      semanas.push(`S${8-i}`);
      counts.push(aulas.filter(a=>a.data>=start.toISOString().slice(0,10)&&a.data<=end.toISOString().slice(0,10)&&a.status==='concluido').length);
    }

    const cv = document.getElementById('chartFreqSemanal');
    const ctx2d = cv?.getContext('2d');
    let grad;
    if (ctx2d) { grad=ctx2d.createLinearGradient(0,0,0,200); grad.addColorStop(0,'#6366f155'); grad.addColorStop(1,'#6366f105'); }

    Relatorios.mk('chartFreqSemanal',{
      type:'line',
      data:{ labels:semanas, datasets:[{
        label:'Aulas Concluídas', data:counts,
        borderColor:'#6366f1', borderWidth:2.5, backgroundColor:grad||'rgba(99,102,241,0.1)',
        tension:.4, fill:true, pointBackgroundColor:'#6366f1', pointRadius:5,
        pointHoverRadius:7, pointBorderColor:'#fff', pointBorderWidth:2,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{labels:{color:t}}, tooltip:{...Relatorios.tooltipDefaults()} },
        scales:{ x:{grid:{color:g},ticks:{color:t}}, y:{grid:{color:g},ticks:{color:t,stepSize:1,precision:0}} }
      }
    });
  },

  /* 5. CANCELAMENTOS — Barras com ícone e cor vermelha */
  renderCancelamentos() {
    const aulas=DB.get('aulas');
    const {g,t}=Relatorios.d();
    const now=new Date(); const meses=[],counts=[];
    for (let i=5;i>=0;i--) {
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      meses.push(Utils.monthName(d.getMonth()));
      counts.push(aulas.filter(a=>a.data.startsWith(key)&&a.status==='cancelado').length);
    }
    Relatorios.mk('chartCancelamentos',{
      type:'bar',
      data:{ labels:meses, datasets:[{
        label:'Cancelamentos', data:counts,
        backgroundColor:counts.map(v=>v>0?'rgba(239,68,68,.65)':'rgba(100,116,139,.25)'),
        borderColor:counts.map(v=>v>0?'#ef4444':'#64748b'),
        borderWidth:2, borderRadius:8, borderSkipped:false,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{...Relatorios.tooltipDefaults()} },
        scales:{ x:{grid:{color:g},ticks:{color:t}}, y:{grid:{color:g},ticks:{color:t,stepSize:1,precision:0}} }
      }
    });
  },

  /* 6. CRESCIMENTO — Linha com área teal */
  renderCrescimento() {
    const alunos=DB.get('alunos');
    const {g,t}=Relatorios.d();
    const now=new Date(); const meses=[],counts=[];
    for (let i=5;i>=0;i--) {
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      meses.push(Utils.monthName(d.getMonth()));
      counts.push(alunos.filter(a=>(a.createdAt||'').startsWith(key)).length);
    }
    const cv=document.getElementById('chartCrescimento');
    const ctx2d=cv?.getContext('2d');
    let grad;
    if (ctx2d) { grad=ctx2d.createLinearGradient(0,0,0,200); grad.addColorStop(0,'#14b8a655'); grad.addColorStop(1,'#14b8a605'); }

    Relatorios.mk('chartCrescimento',{
      type:'line',
      data:{ labels:meses, datasets:[{
        label:'Novos Alunos', data:counts,
        borderColor:'#14b8a6', borderWidth:2.5, backgroundColor:grad||'rgba(20,184,166,0.1)',
        tension:.4, fill:true, pointBackgroundColor:'#14b8a6', pointRadius:5,
        pointHoverRadius:7, pointBorderColor:'#fff', pointBorderWidth:2,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{...Relatorios.tooltipDefaults()} },
        scales:{ x:{grid:{color:g},ticks:{color:t}}, y:{grid:{color:g},ticks:{color:t,stepSize:1,precision:0}} }
      }
    });
  },

  exportPDF()   { Utils.toast('Gerando PDF… (simulado)','info'); setTimeout(()=>Utils.toast('PDF pronto! ✅','success'),1800); },
  exportExcel() { Utils.toast('Gerando Excel… (simulado)','info'); setTimeout(()=>Utils.toast('Excel pronto! ✅','success'),1800); }
};
