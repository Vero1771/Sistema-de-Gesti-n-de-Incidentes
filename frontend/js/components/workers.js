import { api } from '../api.js';
import { state } from '../state.js';
import { showAlert, showModal, closeModal, showConfirm } from '../utils/ui.js';
import { formatDate, getFullName, getInitials } from '../utils/helpers.js';

export async function loadWorkers() {
  const tbody = document.getElementById('workers-tbody');
  const loader = document.getElementById('workers-loader');

  if (!state.token) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="loading">
          <img src="../icons/lock.svg" alt="Lock" class="inline-icon">
          Inicia sesion para ver los trabajadores
        </td>
      </tr>
    `;
    return;
  }

  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.get('/workers');

    if (response.success && response.data) {
      state.workers = response.data;
      state.filteredWorkers = [...state.workers];
      renderWorkers(state.filteredWorkers);
    } else {
      tbody.innerHTML = '<tr><td colspan="9" class="loading">Error al cargar trabajadores</td></tr>';
    }
  } catch (error) {
    console.error('Error loading workers:', error);
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Error al cargar trabajadores</td></tr>';
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

export function renderWorkers(workers) {
  const tbody = document.getElementById('workers-tbody');

  if (!workers || workers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="loading">No hay trabajadores registrados</td></tr>';
    return;
  }

  tbody.innerHTML = workers.map(w => {
    const fullName = getFullName(w.primer_nombre, w.segundo_nombre, w.primer_apellido, w.segundo_apellido);
    const initials = getInitials(w.primer_nombre, w.primer_apellido);
    
    return `
      <tr class="clickable-row" data-id="${w._id}">
        <td><span class="avatar">${initials}</span></td>
        <td><strong>${fullName}</strong></td>
        <td>${w.cedula}</td>
        <td>${w.numero_trabajador}</td>
        <td>${w.departmentId?.nombre || '-'}</td>
        <td>${w.workCenterId?.nombre || '-'}</td>
        <td>${w.cargo}</td>
        <td>
          <span class="badge badge-${w.genero || 'no'}">${w.genero || 'N/A'}</span>
        </td>
        <td>
          <button class="btn-edit" onclick="event.stopPropagation(); window.editWorker('${w._id}')">
            <img src="../icons/edit.svg" alt="Edit" class="btn-icon-sm">
          </button>
          <button class="btn-delete" onclick="event.stopPropagation(); window.deleteWorker('${w._id}')">
            <img src="../icons/delete.svg" alt="Delete" class="btn-icon-sm">
          </button>
          <button class="btn-view" onclick="event.stopPropagation(); window.showWorkerDetail('${w._id}')">
            <img src="../icons/read.svg" alt="View" class="btn-icon-sm">
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('#workers-tbody .clickable-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      const id = this.dataset.id;
      showWorkerDetail(id);
    });
  });
}

export function filterWorkers(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    state.filteredWorkers = [...state.workers];
  } else {
    const term = searchTerm.toLowerCase().trim();
    state.filteredWorkers = state.workers.filter(w =>
      w.primer_nombre.toLowerCase().includes(term) ||
      w.primer_apellido.toLowerCase().includes(term) ||
      w.cedula.includes(term) ||
      w.numero_trabajador.includes(term) ||
      w.email?.toLowerCase().includes(term) ||
      w.telefono?.includes(term) ||
      (w.departmentId?.nombre && w.departmentId.nombre.toLowerCase().includes(term)) ||
      (w.workCenterId?.nombre && w.workCenterId.nombre.toLowerCase().includes(term))
    );
  }
  renderWorkers(state.filteredWorkers);
}

export async function createWorker(data) {
  try {
    const response = await api.post('/workers', data);
    if (response.success) {
      showAlert('Trabajador creado correctamente', 'success');
      await loadWorkers();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al crear trabajador');
    return false;
  }
}

export async function updateWorker(id, data) {
  try {
    const response = await api.put(`/workers/${id}`, data);
    if (response.success) {
      showAlert('Trabajador actualizado correctamente', 'success');
      await loadWorkers();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al actualizar trabajador');
    return false;
  }
}

export async function deleteWorker(id) {
  showConfirm(
    'Esta seguro de eliminar este trabajador?',
    async () => {
      try {
        const response = await api.delete(`/workers/${id}`);
        if (response.success) {
          showAlert('Trabajador eliminado correctamente', 'success');
          await loadWorkers();
        }
      } catch (error) {
        showAlert(error.message || 'Error al eliminar trabajador');
      }
    }
  );
}

export async function showWorkerDetail(id) {
  try {
    const response = await api.get(`/workers/${id}`);
    
    if (response.success) {
      const { worker, reports } = response.data;
      const fullName = getFullName(worker.primer_nombre, worker.segundo_nombre, worker.primer_apellido, worker.segundo_apellido);
      
      const content = `
        <div class="worker-detail">
          <div class="worker-info">
            <div class="info-grid">
              <div class="info-item">
                <label>Cedula:</label>
                <span>${worker.cedula}</span>
              </div>
              <div class="info-item">
                <label>N° Trabajador:</label>
                <span>${worker.numero_trabajador}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>${worker.email || '-'}</span>
              </div>
              <div class="info-item">
                <label>Telefono:</label>
                <span>${worker.telefono || '-'}</span>
              </div>
              <div class="info-item">
                <label>Genero:</label>
                <span>${worker.genero || '-'}</span>
              </div>
              <div class="info-item">
                <label>Departamento:</label>
                <span>${worker.departmentId?.nombre || '-'}</span>
              </div>
              <div class="info-item">
                <label>Centro de Trabajo:</label>
                <span>${worker.workCenterId?.nombre || '-'}</span>
              </div>
              <div class="info-item">
                <label>Ubicacion:</label>
                <span>${worker.workCenterId?.ubicacion || '-'}</span>
              </div>
              <div class="info-item">
                <label>Cargo:</label>
                <span>${worker.cargo}</span>
              </div>
              <div class="info-item">
                <label>Fecha Nacimiento:</label>
                <span>${formatDate(worker.fecha_nacimiento)}</span>
              </div>
              <div class="info-item">
                <label>Fecha Ingreso:</label>
                <span>${formatDate(worker.fecha_ingreso)}</span>
              </div>
            </div>
          </div>
          
          <div class="worker-reports">
            <h4>
              <img src="../icons/read.svg" alt="Reports" class="section-icon">
              Reportes del trabajador (${reports?.length || 0})
            </h4>
            ${!reports || reports.length === 0 ? '<p class="text-muted">No hay reportes asociados</p>' : `
              <div class="reports-list">
                ${reports.map(r => `
                  <div class="report-item">
                    <div class="report-header">
                      <strong>${r.titulo}</strong>
                      <span class="badge badge-${r.estado}">${r.estado}</span>
                    </div>
                    <div class="report-meta">
                      <span class="badge badge-${r.tipo}">${r.tipo}</span>
                      <span class="badge badge-${r.severidad}">${r.severidad}</span>
                      <span>${formatDate(r.fecha_reporte)}</span>
                    </div>
                    <p>${r.descripcion}</p>
                    ${r.evidencias ? `<div class="evidence-link"><img src="../icons/file-export.svg" alt="Evidence" class="inline-icon"> Evidencia adjunta</div>` : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" onclick="closeModal()">Cerrar</button>
          <button class="btn-primary" onclick="closeModal(); window.addReportForWorker('${worker._id}')">
            <img src="../icons/add.svg" alt="Add" class="btn-icon">
            Agregar Reporte
          </button>
        </div>
      `;
      
      showModal('Trabajador: ' + fullName, content);
    }
  } catch (error) {
    showAlert(error.message || 'Error al cargar detalles del trabajador');
  }
}

export function showWorkerForm(id = null) {
  const isEdit = !!id;
  const title = isEdit ? 'Editar Trabajador' : 'Nuevo Trabajador';

  Promise.all([
    api.get('/departments'),
    api.get('/work-centers')
  ]).then(([deptRes, wcRes]) => {
    const departments = deptRes.success ? deptRes.data : [];
    const workCenters = wcRes.success ? wcRes.data : [];

    let workerData = {};
    if (isEdit) {
      const worker = state.workers.find(w => w._id === id);
      if (worker) workerData = worker;
    }

    const formHtml = `
      <form id="worker-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Primer Nombre</label>
            <input type="text" id="wf-primer_nombre" value="${workerData.primer_nombre || ''}" required>
          </div>
          <div class="form-group">
            <label>Segundo Nombre</label>
            <input type="text" id="wf-segundo_nombre" value="${workerData.segundo_nombre || ''}">
          </div>
          <div class="form-group">
            <label>Primer Apellido</label>
            <input type="text" id="wf-primer_apellido" value="${workerData.primer_apellido || ''}" required>
          </div>
          <div class="form-group">
            <label>Segundo Apellido</label>
            <input type="text" id="wf-segundo_apellido" value="${workerData.segundo_apellido || ''}" required>
          </div>
          <div class="form-group">
            <label>Cedula (8 digitos)</label>
            <input type="text" id="wf-cedula" pattern="\\d{8}" maxlength="8" value="${workerData.cedula || ''}" required>
          </div>
          <div class="form-group">
            <label>Numero de Trabajador</label>
            <input type="text" id="wf-numero_trabajador" value="${workerData.numero_trabajador || ''}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="wf-email" value="${workerData.email || ''}" placeholder="correo@ejemplo.com">
          </div>
          <div class="form-group">
            <label>Telefono</label>
            <input type="tel" id="wf-telefono" value="${workerData.telefono || ''}" placeholder="0412-1234567">
          </div>
          <div class="form-group">
            <label>Genero</label>
            <select id="wf-genero">
              <option value="">Seleccionar...</option>
              <option value="masculino" ${workerData.genero === 'masculino' ? 'selected' : ''}>Masculino</option>
              <option value="femenino" ${workerData.genero === 'femenino' ? 'selected' : ''}>Femenino</option>
              <option value="otro" ${workerData.genero === 'otro' ? 'selected' : ''}>Otro</option>
              <option value="prefiero_no_decir" ${workerData.genero === 'prefiero_no_decir' ? 'selected' : ''}>Prefiero no decir</option>
            </select>
          </div>
          <div class="form-group">
            <label>Departamento</label>
            <select id="wf-department" required>
              <option value="">Seleccionar...</option>
              ${departments.map(d => `
                <option value="${d._id}" ${workerData.departmentId?._id === d._id ? 'selected' : ''}>
                  ${d.nombre}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Centro de Trabajo</label>
            <select id="wf-work-center" required>
              <option value="">Seleccionar...</option>
              ${workCenters.map(wc => `
                <option value="${wc._id}" ${workerData.workCenterId?._id === wc._id ? 'selected' : ''}>
                  ${wc.nombre} - ${wc.ubicacion}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Cargo</label>
            <input type="text" id="wf-cargo" value="${workerData.cargo || ''}" required>
          </div>
          <div class="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" id="wf-fecha_nacimiento" value="${workerData.fecha_nacimiento ? workerData.fecha_nacimiento.split('T')[0] : ''}" required>
          </div>
          <div class="form-group">
            <label>Fecha de Ingreso</label>
            <input type="date" id="wf-fecha_ingreso" value="${workerData.fecha_ingreso ? workerData.fecha_ingreso.split('T')[0] : ''}" required>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-submit">
            <img src="../icons/check.svg" alt="Save" class="btn-icon">
            ${isEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    `;

    showModal(title, formHtml);

    document.getElementById('worker-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        primer_nombre: document.getElementById('wf-primer_nombre').value.trim(),
        segundo_nombre: document.getElementById('wf-segundo_nombre').value.trim() || null,
        primer_apellido: document.getElementById('wf-primer_apellido').value.trim(),
        segundo_apellido: document.getElementById('wf-segundo_apellido').value.trim(),
        cedula: document.getElementById('wf-cedula').value.trim(),
        numero_trabajador: document.getElementById('wf-numero_trabajador').value.trim(),
        email: document.getElementById('wf-email').value.trim() || null,
        telefono: document.getElementById('wf-telefono').value.trim() || null,
        genero: document.getElementById('wf-genero').value || 'prefiero_no_decir',
        departmentId: document.getElementById('wf-department').value,
        workCenterId: document.getElementById('wf-work-center').value,
        cargo: document.getElementById('wf-cargo').value.trim(),
        fecha_nacimiento: document.getElementById('wf-fecha_nacimiento').value,
        fecha_ingreso: document.getElementById('wf-fecha_ingreso').value
      };

      const required = ['primer_nombre', 'primer_apellido', 'segundo_apellido', 'cedula', 'numero_trabajador', 'departmentId', 'workCenterId', 'cargo', 'fecha_nacimiento', 'fecha_ingreso'];
      for (let field of required) {
        if (!data[field]) {
          showAlert('Todos los campos obligatorios deben estar llenos');
          return;
        }
      }

      if (data.departmentId === '' || data.workCenterId === '') {
        showAlert('Debe seleccionar un departamento y un centro de trabajo');
        return;
      }

      let success;
      if (isEdit) {
        success = await updateWorker(id, data);
      } else {
        success = await createWorker(data);
      }

      if (success) closeModal();
    });
  }).catch(error => {
    showAlert('Error al cargar datos para el formulario');
  });
}

window.loadWorkers = loadWorkers;
window.renderWorkers = renderWorkers;
window.filterWorkers = filterWorkers;
window.showWorkerDetail = showWorkerDetail;
window.showWorkerForm = showWorkerForm;
window.editWorker = showWorkerForm;
window.deleteWorker = deleteWorker;
window.addReportForWorker = (workerId) => {
  if (window.showReportForm) {
    window.showReportForm(workerId);
  }
};