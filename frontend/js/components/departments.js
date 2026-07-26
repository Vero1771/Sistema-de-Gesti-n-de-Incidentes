import { api } from '../api.js';
import { state } from '../state.js';
import { showAlert, showModal, closeModal, showConfirm } from '../utils/ui.js';

export async function loadDepartments() {
  const tbody = document.getElementById('departments-tbody');
  const loader = document.getElementById('departments-loader');

  if (!state.token) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="loading">
          <img src="../icons/lock.svg" alt="Lock" class="inline-icon">
          Inicia sesion para ver los departamentos
        </td>
      </tr>
    `;
    return;
  }

  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.get('/departments');

    if (response.success && response.data) {
      state.departments = response.data;
      state.filteredDepartments = [...state.departments];
      renderDepartments(state.filteredDepartments);
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Error al cargar departamentos</td></tr>';
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

export function renderDepartments(departments) {
  const tbody = document.getElementById('departments-tbody');

  if (!departments || departments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay departamentos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = departments.map(d => {
    const workerCount = state.workers.filter(w => w.departmentId?._id === d._id).length;
    
    return `
      <tr class="clickable-row" data-id="${d._id}" data-name="${d.nombre}">
        <td>${d._id.slice(-6)}</td>
        <td><strong>${d.nombre}</strong></td>
        <td>${workerCount}</td>
        <td>
          <button class="btn-edit" onclick="event.stopPropagation(); window.editDepartment('${d._id}')">
            <img src="../icons/edit.svg" alt="Edit" class="btn-icon-sm">
          </button>
          <button class="btn-delete" onclick="event.stopPropagation(); window.deleteDepartment('${d._id}')">
            <img src="../icons/delete.svg" alt="Delete" class="btn-icon-sm">
          </button>
          <button class="btn-view" onclick="event.stopPropagation(); window.showDepartmentDetail('${d._id}')">
            <img src="../icons/workers.svg" alt="View" class="btn-icon-sm">
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('#departments-tbody .clickable-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      const id = this.dataset.id;
      const name = this.dataset.name;
      showDepartmentDetail(id, name);
    });
  });
}

export function filterDepartments(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    state.filteredDepartments = [...state.departments];
  } else {
    const term = searchTerm.toLowerCase().trim();
    state.filteredDepartments = state.departments.filter(d =>
      d.nombre.toLowerCase().includes(term)
    );
  }
  renderDepartments(state.filteredDepartments);
}

export async function showDepartmentDetail(id, name) {
  try {
    const response = await api.get(`/workers?department=${name || ''}`);
    
    if (response.success) {
      const workers = response.data || [];
      const deptWorkers = workers.filter(w => 
        w.departmentId?._id === id || 
        w.departmentId === id
      );

      if (deptWorkers.length === 0) {
        showAlert('No hay trabajadores en el departamento "' + name + '"', 'success');
        return;
      }

      const workersHtml = deptWorkers.map(w => `
        <div class="worker-card clickable" data-worker-id="${w._id}" style="
          padding: 12px 15px;
          margin: 8px 0;
          background: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid #2e86c1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <strong>${w.primer_nombre} ${w.primer_apellido}</strong>
            <span style="margin-left: 10px; color: #666; font-size: 13px;">
              ${w.cargo || 'Sin cargo'}
            </span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="color: #666; font-size: 12px;">
              ${w.cedula}
            </span>
            <span style="color: #2e86c1; font-size: 16px;">→</span>
          </div>
        </div>
      `).join('');

      const modalContent = `
        <div style="max-height: 60vh; overflow-y: auto;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <img src="../icons/building.svg" alt="Department" style="width: 32px; height: 32px;">
            <div>
              <h3 style="margin: 0;">Departamento: ${name}</h3>
              <p style="margin: 0; color: #666;">
                <strong>Total de trabajadores:</strong> ${deptWorkers.length}
              </p>
            </div>
          </div>
          
          <div style="background: #eaf2f8; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px;">
            <strong>Lista de trabajadores:</strong>
          </div>
          
          <div id="workers-list-container">
            ${workersHtml}
          </div>
        </div>
        <div class="form-actions" style="margin-top: 15px;">
          <button class="btn-cancel" onclick="closeModal()">Cerrar</button>
          <button class="btn-primary" onclick="closeModal(); window.navigateToWorkerList('${id}', '${name}')">
            <img src="../icons/workers.svg" alt="View" class="btn-icon">
            Ver en tabla
          </button>
        </div>
      `;

      showModal('Trabajadores del Departamento: ' + name, modalContent);

      document.querySelectorAll('.worker-card.clickable').forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.background = '#e8f4fd';
          this.style.transform = 'scale(1.01)';
        });
        card.addEventListener('mouseleave', function() {
          this.style.background = '#f8f9fa';
          this.style.transform = 'scale(1)';
        });
        card.addEventListener('click', function() {
          const workerId = this.dataset.workerId;
          closeModal();
          if (window.showWorkerDetail) {
            window.showWorkerDetail(workerId);
          }
        });
      });
    }
  } catch (error) {
    showAlert(error.message || 'Error al cargar trabajadores del departamento');
  }
}

export async function createDepartment(data) {
  try {
    const response = await api.post('/departments', data);
    if (response.success) {
      showAlert('Departamento creado correctamente', 'success');
      await loadDepartments();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al crear departamento');
    return false;
  }
}

export async function updateDepartment(id, data) {
  try {
    const response = await api.put(`/departments/${id}`, data);
    if (response.success) {
      showAlert('Departamento actualizado correctamente', 'success');
      await loadDepartments();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al actualizar departamento');
    return false;
  }
}

export async function deleteDepartment(id) {
  showConfirm(
    'Esta seguro de eliminar este departamento?',
    async () => {
      try {
        const response = await api.delete(`/departments/${id}`);
        if (response.success) {
          showAlert('Departamento eliminado correctamente', 'success');
          await loadDepartments();
        }
      } catch (error) {
        showAlert(error.message || 'Error al eliminar departamento');
      }
    }
  );
}

export function showDepartmentForm(id = null) {
  const isEdit = !!id;
  const title = isEdit ? 'Editar Departamento' : 'Nuevo Departamento';

  let deptData = {};
  if (isEdit) {
    const dept = state.departments.find(d => d._id === id);
    if (dept) deptData = dept;
  }

  const formHtml = `
    <form id="department-form">
      <div class="form-group">
        <label>Nombre del Departamento</label>
        <input type="text" id="df-nombre" value="${deptData.nombre || ''}" required>
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

  document.getElementById('department-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('df-nombre').value.trim();

    if (!nombre) {
      showAlert('El nombre es obligatorio');
      return;
    }

    let success;
    if (isEdit) {
      success = await updateDepartment(id, { nombre });
    } else {
      success = await createDepartment({ nombre });
    }

    if (success) closeModal();
  });
}

window.loadDepartments = loadDepartments;
window.renderDepartments = renderDepartments;
window.filterDepartments = filterDepartments;
window.showDepartmentDetail = showDepartmentDetail;
window.editDepartment = showDepartmentForm;
window.deleteDepartment = deleteDepartment;