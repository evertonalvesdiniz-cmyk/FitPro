/* ============================================================
   MÓDULO: Agenda — FullCalendar + CRUD de aulas
============================================================ */
const Agenda = {
  calendar: null,

  initCalendar() {
    const el = Utils.el('calendar');
    if (!el) return;
    if (Agenda.calendar) {
      Agenda.calendar.destroy();
      Agenda.calendar = null;
    }

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    Agenda.calendar = new FullCalendar.Calendar(el, {
      locale: 'pt-br',
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: Agenda.getCalendarEvents(),
      eventClick(info) {
        Agenda.showDetail(info.event.id);
      },
      dateClick(info) {
        Agenda.openModal(null, info.dateStr);
      },
      eventDrop(info) {
        const id = info.event.id;
        const novaData = info.event.startStr.slice(0,10);
        DB.update('aulas', id, { data: novaData });
        Utils.toast('Aula reagendada!', 'success');
      },
      editable: true,
      selectable: true,
    });

    Agenda.calendar.render();
  },

  getCalendarEvents() {
    const aulas = DB.get('aulas');
    const alunos = DB.get('alunos');
    const colors = { confirmado: '#6366f1', concluido: '#10b981', cancelado: '#ef4444' };

    return aulas.map(au => {
      const aluno = alunos.find(a => a.id === au.alunoId);
      return {
        id: au.id,
        title: aluno?.nome?.split(' ')[0] || 'Aula',
        start: `${au.data}T${au.hora}`,
        end: au.data + 'T' + Agenda.addMinutes(au.hora, au.duracao || 60),
        backgroundColor: (colors[au.status] || '#6366f1') + 'cc',
        borderColor: colors[au.status] || '#6366f1',
        textColor: '#fff',
      };
    });
  },

  addMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  },

  refreshCalendar() {
    if (Agenda.calendar) {
      Agenda.calendar.removeAllEvents();
      Agenda.calendar.addEventSource(Agenda.getCalendarEvents());
    }
  },

  openModal(id = null, date = null) {
    Utils.el('aulaEditId').value = id || '';
    Utils.setHtml('modalAulaTitle', id ? 'Editar Aula' : 'Nova Aula');
    Utils.fillAlunosSelect('aulaAluno', '', true);

    const btnDel = Utils.el('btnDeleteAula');
    if (btnDel) id ? btnDel.classList.remove('hidden') : btnDel.classList.add('hidden');

    if (id) {
      const au = DB.findById('aulas', id);
      if (!au) return;
      Utils.setVal('aulaAluno', au.alunoId);
      Utils.setVal('aulaStatus', au.status);
      Utils.setVal('aulaData', au.data);
      Utils.setVal('aulaHora', au.hora);
      Utils.setVal('aulaDuracao', au.duracao || 60);
      Utils.setVal('aulaLocal', au.local);
      Utils.setVal('aulaEndereco', au.endereco);
      Utils.setVal('aulaObs', au.obs);
    } else {
      Utils.setVal('aulaData', date || Utils.today());
      Utils.setVal('aulaHora', '08:00');
      Utils.setVal('aulaDuracao', 60);
      Utils.setVal('aulaLocal', 'Academia');
      Utils.setVal('aulaEndereco', '');
      Utils.setVal('aulaObs', '');
      Utils.setVal('aulaStatus', 'confirmado');
    }

    const rec = Utils.el('aulaRecorrente');
    if (rec) rec.checked = false;
    Utils.el('recorrenciaGrp')?.classList.add('hidden');

    Utils.openModal('modalAula');
  },

  toggleRecorrencia() {
    const checked = Utils.el('aulaRecorrente')?.checked;
    checked ? Utils.show('recorrenciaGrp') : Utils.hide('recorrenciaGrp');
  },

  save() {
    const alunoId = Utils.val('aulaAluno');
    const data = Utils.val('aulaData');
    const hora = Utils.val('aulaHora');
    if (!alunoId || !data || !hora) {
      Utils.toast('Preencha aluno, data e horário!', 'warning'); return;
    }

    const id = Utils.val('aulaEditId');
    const aulaData = {
      alunoId, data, hora,
      duracao: +Utils.val('aulaDuracao') || 60,
      local: Utils.val('aulaLocal'),
      endereco: Utils.val('aulaEndereco'),
      obs: Utils.val('aulaObs'),
      status: Utils.val('aulaStatus'),
    };

    if (id) {
      DB.update('aulas', id, aulaData);
      Utils.toast('Aula atualizada!', 'success');
    } else {
      DB.insert('aulas', aulaData);
      // Recorrência
      const recorrente = Utils.el('aulaRecorrente')?.checked;
      if (recorrente) {
        const semanas = +Utils.val('aulaRecSemanas') || 4;
        for (let i = 1; i <= semanas; i++) {
          const d = new Date(data + 'T12:00:00');
          d.setDate(d.getDate() + i * 7);
          DB.insert('aulas', { ...aulaData, data: d.toISOString().slice(0,10) });
        }
        Utils.toast(`Aula criada com ${semanas} recorrências!`, 'success');
      } else {
        Utils.toast('Aula criada!', 'success');
      }
    }

    Utils.closeModal('modalAula');
    Agenda.refreshCalendar();
    Dashboard.render();
  },

  deleteFromModal() {
    const id = Utils.val('aulaEditId');
    if (!id) return;
    Utils.confirm('Excluir Aula', 'Tem certeza que deseja excluir esta aula?', () => {
      DB.delete('aulas', id);
      Utils.closeModal('modalAula');
      Agenda.refreshCalendar();
      Dashboard.render();
      Utils.toast('Aula excluída.', 'info');
    });
  },

  showDetail(id) {
    const au = DB.findById('aulas', id);
    if (!au) return;
    const alunos = DB.get('alunos');
    const aluno = alunos.find(a => a.id === au.alunoId);

    Utils.el('aulaDetailId').value = id;
    Utils.setHtml('aulaDetailBody', `
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-user"></i> Aluno</span><span>${aluno?.nome || '—'}</span></div>
        <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-calendar"></i> Data</span><span>${Utils.formatDate(au.data)}</span></div>
        <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-clock"></i> Horário</span><span>${au.hora} (${au.duracao||60} min)</span></div>
        <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-location-dot"></i> Local</span><span>${au.local}</span></div>
        ${au.endereco ? `<div class="detail-row"><span class="detail-label"><i class="fa-solid fa-map-pin"></i> Endereço</span><span>${au.endereco}</span></div>` : ''}
        <div class="detail-row"><span class="detail-label"><i class="fa-solid fa-circle-dot"></i> Status</span><span>${Utils.badge(au.status)}</span></div>
        ${au.obs ? `<div class="detail-row"><span class="detail-label"><i class="fa-solid fa-note-sticky"></i> Observações</span><span>${au.obs}</span></div>` : ''}
      </div>`);
    Utils.openModal('modalAulaDetail');
  },

  editFromDetail() {
    const id = Utils.val('aulaDetailId');
    Utils.closeModal('modalAulaDetail');
    setTimeout(() => Agenda.openModal(id), 150);
  },

  deleteFromDetail() {
    const id = Utils.val('aulaDetailId');
    Utils.confirm('Excluir Aula', 'Tem certeza que deseja excluir esta aula?', () => {
      DB.delete('aulas', id);
      Utils.closeModal('modalAulaDetail');
      Agenda.refreshCalendar();
      Dashboard.render();
      Utils.toast('Aula excluída.', 'info');
    });
  }
};
