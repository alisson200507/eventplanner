let asistChartInstance = null, pvRChartInstance = null;

async function renderReportes() {
  const [eventos, invitados, presupuestos] = await Promise.all([DB.getEventos(), DB.getInvitados(), DB.getPresupuestos()]);
  const concluidos = eventos.filter(e => e.estado === 'concluido');
  const proximos = eventos.filter(e => e.estado === 'proximo' || e.estado === 'en_curso');
  document.getElementById('repConcluidos').textContent = '$' + concluidos.reduce((s,e)=>s+parseFloat(e.presupuesto||0),0).toLocaleString();
  document.getElementById('repProximos').textContent = proximos.length;
  document.getElementById('repPresupuesto').textContent = '$' + presupuestos.reduce((s,p)=>s+parseFloat(p.presupuesto||0),0).toLocaleString();
  const labels = eventos.slice(0,6).map(e => e.nombre.substring(0,14)+'...');
  const ctx1 = document.getElementById('asistenciaChart').getContext('2d');
  if (asistChartInstance) asistChartInstance.destroy();
  asistChartInstance = new Chart(ctx1, { type:'bar', data:{ labels, datasets:[
    { label:'Asistieron', data: eventos.slice(0,6).map(e=>invitados.filter(i=>i.evento_id===e.id&&i.asistencia==='asistio').length), backgroundColor:'#5cb882' },
    { label:'Pendientes', data: eventos.slice(0,6).map(e=>invitados.filter(i=>i.evento_id===e.id&&i.rsvp==='pendiente').length), backgroundColor:'#d4a843' }
  ]}, options:{ responsive:true, plugins:{ legend:{ labels:{ color:'#a09890', font:{family:'DM Sans'} } } }, scales:{ x:{ticks:{color:'#6b6460'},grid:{color:'#2e2b28'}}, y:{ticks:{color:'#6b6460'},grid:{color:'#2e2b28'}} } } });
  const ctx2 = document.getElementById('presupVsRealChart').getContext('2d');
  if (pvRChartInstance) pvRChartInstance.destroy();
  pvRChartInstance = new Chart(ctx2, { type:'bar', data:{ labels, datasets:[
    { label:'Presupuesto', data: eventos.slice(0,6).map(e=>presupuestos.filter(p=>p.evento_id===e.id).reduce((s,p)=>s+parseFloat(p.presupuesto||0),0)), backgroundColor:'#4a9eff' },
    { label:'Gastado', data: eventos.slice(0,6).map(e=>presupuestos.filter(p=>p.evento_id===e.id).reduce((s,p)=>s+parseFloat(p.gastado||0),0)), backgroundColor:'#e85d7a' }
  ]}, options:{ responsive:true, plugins:{ legend:{ labels:{ color:'#a09890', font:{family:'DM Sans'} } } }, scales:{ x:{ticks:{color:'#6b6460'},grid:{color:'#2e2b28'}}, y:{ticks:{color:'#6b6460',callback:v=>'$'+v.toLocaleString()},grid:{color:'#2e2b28'}} } } });
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const [eventos, presupuestos] = await Promise.all([DB.getEventos(), DB.getPresupuestos()]);
  doc.setFontSize(20); doc.setTextColor(212,168,67);
  doc.text('EventPlanner — Reporte General', 14, 20);
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})}`, 14, 28);
  let y = 40;
  doc.setFontSize(14); doc.setTextColor(50); doc.text('Eventos', 14, y); y += 8;
  eventos.forEach(e => { doc.setFontSize(10); doc.setTextColor(30); doc.text(`• ${e.nombre} — ${e.fecha?.substring(0,10)} — ${e.lugar||''}`, 16, y); y += 6; if(y>270){doc.addPage();y=20;} });
  y += 6; doc.setFontSize(14); doc.setTextColor(50); doc.text('Presupuestos', 14, y); y += 8;
  presupuestos.forEach(p => { const ev = eventos.find(e=>e.id===p.evento_id); doc.setFontSize(10); doc.setTextColor(30); doc.text(`• ${p.categoria} (${ev?ev.nombre:'?'}) — $${parseFloat(p.presupuesto).toLocaleString()} / $${parseFloat(p.gastado).toLocaleString()}`, 16, y); y += 6; if(y>270){doc.addPage();y=20;} });
  doc.save('EventPlanner_Reporte.pdf'); showToast('PDF descargado ✓','success');
}

document.addEventListener('DOMContentLoaded', renderReportes);