import { api } from '../api.js';
import { state } from '../state.js';
import { showAlert, showModal, closeModal, showConfirm } from '../utils/ui.js';
import { formatDate } from '../utils/helpers.js';

export async function loadReports() {
  const tbody = document.getElementById('reports-tbody');
  const loader = document.getElementById('reports-loader');

  if (!state.token) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading">
          <img src="../icons/lock.svg" alt="Lock" class="inline-icon">
          Inicia sesion para ver los reportes
        </td>
      </tr>
    `;
    return;
  }

  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.get('/reports');

    if (response.success && response.data) {
      state.reports = response.data;
      state.filteredReports = [...state.reports];
      renderReports(state.filteredReports);
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar reportes</td></tr>';
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

export function renderReports(reports) {
  const tbody = document.getElementById('reports-tbody');

  if (!reports || reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay reportes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(r => `
    <tr>
      <td>${r.workerId?.primer_nombre || ''} ${r.workerId?.primer_apellido || ''}</td>
      <td><strong>${r.titulo}</strong></td>
      <td><span class="badge badge-${r.tipo}">${r.tipo}</span></td>
      <td><span class="badge badge-${r.severidad}">${r.severidad}</span></td>
      <td><span class="badge badge-${r.estado}">${r.estado}</span></td>
      <td>${formatDate(r.fecha_reporte)}</td>
      <td>
        <button class="btn-edit" onclick="window.editReport('${r._id}')">
          <img src="../icons/edit.svg" alt="Edit" class="btn-icon-sm">
        </button>
        <button class="btn-delete" onclick="window.deleteReport('${r._id}')">
          <img src="../icons/delete.svg" alt="Delete" class="btn-icon-sm">
        </button>
        ${r.evidencias ? `<button class="btn-view" onclick="window.viewEvidence('${r._id}')">
          <img src="../icons/file-export.svg" alt="Evidence" class="btn-icon-sm">
        </button>` : ''}
      </td>
    </tr>
  `).join('');
}

export function filterReports(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    state.filteredReports = [...state.reports];
  } else {
    const term = searchTerm.toLowerCase().trim();
    state.filteredReports = state.reports.filter(r =>
      r.titulo.toLowerCase().includes(term) ||
      r.descripcion.toLowerCase().includes(term) ||
      (r.workerId?.primer_nombre && r.workerId.primer_nombre.toLowerCase().includes(term)) ||
      (r.workerId?.primer_apellido && r.workerId.primer_apellido.toLowerCase().includes(term))
    );
  }
  renderReports(state.filteredReports);
}

export async function createReport(data) {
  try {
    const response = await api.post('/reports', data);
    if (response.success) {
      showAlert('Reporte creado correctamente', 'success');
      await loadReports();
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert(error.message || 'Error al crear reporte');
    return false;
  }
}

export async function updateReport(id, data) {
  try {
    const response = await api.put(`/reports/${id}`, data);
    if (response.success) {
      showAlert('Reporte actualizado correctamente', 'success');
      await loadReports();
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert(error.message || 'Error al actualizar reporte');
    return false;
  }
}

export async function deleteReport(id) {
  showConfirm(
    'Esta seguro de eliminar este reporte?',
    async () => {
      try {
        const response = await api.delete(`/reports/${id}`);
        if (response.success) {
          showAlert('Reporte eliminado correctamente', 'success');
          await loadReports();
        }
      } catch (error) {
        showAlert(error.message || 'Error al eliminar reporte');
      }
    }
  );
}

export function viewEvidence(id) {
  const report = state.reports.find(r => r._id === id);
  if (report) {
    let content = '';
    
    if (report.evidenciaData) {
      const isImage = report.evidenciaTipo && report.evidenciaTipo.startsWith('image/');
      
      if (isImage) {
        content = `
          <div class="evidence-preview-container">
            <img src="${report.evidenciaData}" alt="${report.evidencias}" class="evidence-preview">
            <span class="file-name">Archivo: ${report.evidencias || 'Evidencia'}</span>
          </div>
        `;
      } else {
        content = `
          <div style="text-align: center; padding: 20px;">
            <img src="../icons/file-export.svg" alt="Evidence" style="width: 64px; height: 64px; margin-bottom: 15px;">
            <p><strong>Reporte:</strong> ${report.titulo}</p>
            <p><strong>Archivo:</strong> ${report.evidencias}</p>
            <p style="color: #666; font-size: 13px;">El archivo adjunto no es una imagen o no puede mostrarse.</p>
            <p style="color: #666; font-size: 12px;">Tipo: ${report.evidenciaTipo || 'Desconocido'}</p>
          </div>
        `;
      }
    } else {
      content = `
        <div style="text-align: center; padding: 20px;">
          <img src="../icons/file-export.svg" alt="Evidence" style="width: 64px; height: 64px; margin-bottom: 15px;">
          <p><strong>Reporte:</strong> ${report.titulo}</p>
          <p><strong>Archivo:</strong> ${report.evidencias || 'Sin evidencia'}</p>
        </div>
      `;
    }

    showModal('Evidencia del Reporte', `
      <div style="max-height: 60vh; overflow-y: auto;">
        ${content}
        <div class="form-actions" style="margin-top: 20px;">
          <button class="btn-cancel" onclick="closeModal()">Cerrar</button>
        </div>
      </div>
    `);
  }
}

export function editReport(id) {
  const report = state.reports.find(r => r._id === id);
  if (!report) {
    showAlert('Reporte no encontrado');
    return;
  }

  const formHtml = `
    <form id="report-form">
      <div class="form-group">
        <label>Trabajador</label>
        <select id="rf-worker" required>
          <option value="">Seleccionar trabajador...</option>
          ${state.workers.filter(w => w.activo !== false).map(w => `
            <option value="${w._id}" ${w._id === report.workerId?._id ? 'selected' : ''}>
              ${w.primer_nombre} ${w.primer_apellido} - ${w.cedula}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Titulo</label>
        <input type="text" id="rf-titulo" value="${report.titulo || ''}" required>
      </div>
      <div class="form-group">
        <label>Descripcion</label>
        <textarea id="rf-descripcion" rows="4" required>${report.descripcion || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Evidencia (Archivo adjunto)</label>
        ${report.evidencias ? `<p style="color: #2e86c1; font-size: 13px;">Archivo actual: ${report.evidencias}</p>` : ''}
        <input type="file" id="rf-evidencia" accept="image/*,.pdf,.doc,.docx,.zip">
        <small style="color: #666;">Formatos permitidos: JPG, PNG, PDF, DOC, DOCX, ZIP</small>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Tipo</label>
          <select id="rf-tipo" required>
            <option value="incidente" ${report.tipo === 'incidente' ? 'selected' : ''}>Incidente</option>
            <option value="accidente" ${report.tipo === 'accidente' ? 'selected' : ''}>Accidente</option>
            <option value="riesgo" ${report.tipo === 'riesgo' ? 'selected' : ''}>Riesgo</option>
            <option value="capacitacion" ${report.tipo === 'capacitacion' ? 'selected' : ''}>Capacitacion</option>
            <option value="visita" ${report.tipo === 'visita' ? 'selected' : ''}>Visita</option>
            <option value="otro" ${report.tipo === 'otro' ? 'selected' : ''}>Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Severidad</label>
          <select id="rf-severidad">
            <option value="baja" ${report.severidad === 'baja' ? 'selected' : ''}>Baja</option>
            <option value="media" ${report.severidad === 'media' ? 'selected' : ''}>Media</option>
            <option value="alta" ${report.severidad === 'alta' ? 'selected' : ''}>Alta</option>
            <option value="critica" ${report.severidad === 'critica' ? 'selected' : ''}>Critica</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select id="rf-estado">
            <option value="pendiente" ${report.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en_revision" ${report.estado === 'en_revision' ? 'selected' : ''}>En Revision</option>
            <option value="resuelto" ${report.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
            <option value="cerrado" ${report.estado === 'cerrado' ? 'selected' : ''}>Cerrado</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit">
          <img src="../icons/check.svg" alt="Save" class="btn-icon">
          Actualizar Reporte
        </button>
      </div>
    </form>
  `;

  showModal('Editar Reporte', formHtml);

  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      workerId: document.getElementById('rf-worker').value,
      titulo: document.getElementById('rf-titulo').value.trim(),
      descripcion: document.getElementById('rf-descripcion').value.trim(),
      tipo: document.getElementById('rf-tipo').value,
      severidad: document.getElementById('rf-severidad').value,
      estado: document.getElementById('rf-estado').value
    };

    const fileInput = document.getElementById('rf-evidencia');
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      data.evidencias = file.name;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        data.evidenciaData = event.target.result;
        data.evidenciaTipo = file.type;
        submitUpdate();
      };
      reader.onerror = function() {
        showAlert('Error al leer el archivo');
      };
      reader.readAsDataURL(file);
    } else {
      submitUpdate();
    }

    async function submitUpdate() {
      if (!data.workerId || !data.titulo || !data.descripcion) {
        showAlert('Los campos obligatorios deben estar llenos');
        return;
      }

      const success = await updateReport(id, data);
      if (success) closeModal();
    }
  });
}

export function showReportForm(workerId = null) {
  const formHtml = `
    <form id="report-form">
      <div class="form-group">
        <label>Trabajador</label>
        <select id="rf-worker" required>
          <option value="">Seleccionar trabajador...</option>
          ${state.workers.filter(w => w.activo !== false).map(w => `
            <option value="${w._id}" ${w._id === workerId ? 'selected' : ''}>
              ${w.primer_nombre} ${w.primer_apellido} - ${w.cedula}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Titulo</label>
        <input type="text" id="rf-titulo" required>
      </div>
      <div class="form-group">
        <label>Descripcion</label>
        <textarea id="rf-descripcion" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Evidencia (Archivo adjunto)</label>
        <input type="file" id="rf-evidencia" accept="image/*,.pdf,.doc,.docx,.zip">
        <small style="color: #666;">Formatos permitidos: JPG, PNG, PDF, DOC, DOCX, ZIP</small>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Tipo</label>
          <select id="rf-tipo" required>
            <option value="incidente">Incidente</option>
            <option value="accidente">Accidente</option>
            <option value="riesgo">Riesgo</option>
            <option value="capacitacion">Capacitacion</option>
            <option value="visita">Visita</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Severidad</label>
          <select id="rf-severidad">
            <option value="baja">Baja</option>
            <option value="media" selected>Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Critica</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select id="rf-estado">
            <option value="pendiente" selected>Pendiente</option>
            <option value="en_revision">En Revision</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit">
          <img src="../icons/check.svg" alt="Save" class="btn-icon">
          Guardar Reporte
        </button>
      </div>
    </form>
  `;

  showModal('Nuevo Reporte', formHtml);

  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      workerId: document.getElementById('rf-worker').value,
      titulo: document.getElementById('rf-titulo').value.trim(),
      descripcion: document.getElementById('rf-descripcion').value.trim(),
      tipo: document.getElementById('rf-tipo').value,
      severidad: document.getElementById('rf-severidad').value,
      estado: document.getElementById('rf-estado').value
    };

    const fileInput = document.getElementById('rf-evidencia');
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      data.evidencias = file.name;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        data.evidenciaData = event.target.result;
        data.evidenciaTipo = file.type;
        submitCreate();
      };
      reader.onerror = function() {
        showAlert('Error al leer el archivo');
      };
      reader.readAsDataURL(file);
    } else {
      submitCreate();
    }

    async function submitCreate() {
      if (!data.workerId || !data.titulo || !data.descripcion) {
        showAlert('Los campos obligatorios deben estar llenos');
        return;
      }

      const success = await createReport(data);
      if (success) closeModal();
    }
  });
}

window.loadReports = loadReports;
window.renderReports = renderReports;
window.filterReports = filterReports;
window.showReportForm = showReportForm;
window.editReport = editReport;
window.addReportForWorker = showReportForm;
window.viewEvidence = viewEvidence;
window.deleteReport = deleteReport;