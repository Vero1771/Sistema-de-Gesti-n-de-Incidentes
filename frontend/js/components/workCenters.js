import { api } from '../api.js';
import { state } from '../state.js';
import { showAlert, showModal, closeModal, showConfirm } from '../utils/ui.js';

export async function loadWorkCenters() {
  const tbody = document.getElementById('work-centers-tbody');
  const loader = document.getElementById('work-centers-loader');

  if (!state.token) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          <img src="../icons/lock.svg" alt="Lock" class="inline-icon">
          Inicia sesion para ver los centros de trabajo
        </td>
      </tr>
    `;
    return;
  }

  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.get('/work-centers');

    if (response.success && response.data) {
      state.workCenters = response.data;
      state.filteredWorkCenters = [...state.workCenters];
      renderWorkCenters(state.filteredWorkCenters);
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Error al cargar centros</td></tr>';
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

export function renderWorkCenters(workCenters) {
  const tbody = document.getElementById('work-centers-tbody');

  if (!workCenters || workCenters.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay centros registrados</td></tr>';
    return;
  }

  tbody.innerHTML = workCenters.map(wc => {
    const workerCount = state.workers.filter(w => w.workCenterId?._id === wc._id).length;
    
    return `
      <tr class="clickable-row" data-id="${wc._id}">
        <td>${wc._id.slice(-6)}</td>
        <td><strong>${wc.nombre}</strong></td>
        <td>${wc.ubicacion}</td>
        <td>${workerCount}</td>
        <td>
          <button class="btn-edit" onclick="event.stopPropagation(); window.editWorkCenter('${wc._id}')">
            <img src="../icons/edit.svg" alt="Edit" class="btn-icon-sm">
          </button>
          <button class="btn-delete" onclick="event.stopPropagation(); window.deleteWorkCenter('${wc._id}')">
            <img src="../icons/delete.svg" alt="Delete" class="btn-icon-sm">
          </button>
          <button class="btn-view" onclick="event.stopPropagation(); window.showWorkCenterDetail('${wc._id}')">
            <img src="../icons/localization.svg" alt="View" class="btn-icon-sm">
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('#work-centers-tbody .clickable-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      const id = this.dataset.id;
      showWorkCenterDetail(id);
    });
  });
}

export function filterWorkCenters(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    state.filteredWorkCenters = [...state.workCenters];
  } else {
    const term = searchTerm.toLowerCase().trim();
    state.filteredWorkCenters = state.workCenters.filter(wc =>
      wc.nombre.toLowerCase().includes(term) ||
      wc.ubicacion.toLowerCase().includes(term)
    );
  }
  renderWorkCenters(state.filteredWorkCenters);
}

export async function showWorkCenterDetail(id) {
  try {
    const response = await api.get(`/work-centers/${id}`);
    
    if (response.success) {
      const { workCenter, workers } = response.data;
      
      const deptMap = new Map();
      workers.forEach(w => {
        const deptName = w.departmentId?.nombre || 'Sin departamento';
        const deptId = w.departmentId?._id || null;
        if (!deptMap.has(deptName)) {
          deptMap.set(deptName, { id: deptId, workers: [] });
        }
        deptMap.get(deptName).workers.push(w);
      });

      let departmentsHtml = '';
      if (deptMap.size === 0) {
        departmentsHtml = '<p class="text-muted">No hay trabajadores en este centro</p>';
      } else {
        for (let [deptName, data] of deptMap) {
          departmentsHtml += `
            <div class="dept-card clickable" data-dept-id="${data.id}" data-dept-name="${deptName}" style="
              padding: 15px;
              margin: 10px 0;
              background: #f8f9fa;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              border-left: 4px solid #2e86c1;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <div>
                <strong>${deptName}</strong>
                <span style="margin-left: 10px; color: #666; font-size: 13px;">
                  ${data.workers.length} trabajador(es)
                </span>
              </div>
              <span style="color: #2e86c1; font-size: 18px;">→</span>
            </div>
          `;
        }
      }

      const modalContent = `
        <div style="max-height: 60vh; overflow-y: auto;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <img src="../icons/localization.svg" alt="Center" style="width: 32px; height: 32px;">
            <div>
              <h3 style="margin: 0;">${workCenter.nombre}</h3>
              <p style="margin: 0; color: #666;">${workCenter.ubicacion}</p>
            </div>
          </div>
          
          <div style="background: #eaf2f8; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px;">
            <strong>Total de trabajadores:</strong> ${workers.length}
          </div>
          
          <h4 style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <img src="../icons/building.svg" alt="Departments" style="width: 20px; height: 20px;">
            Departamentos en este centro:
          </h4>
          
          <div id="dept-list-container">
            ${departmentsHtml}
          </div>
        </div>
        <div class="form-actions" style="margin-top: 15px;">
          <button class="btn-cancel" onclick="closeModal()">Cerrar</button>
        </div>
      `;

      showModal('Centro de Trabajo: ' + workCenter.nombre, modalContent);

      document.querySelectorAll('.dept-card.clickable').forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.background = '#e8f4fd';
          this.style.transform = 'scale(1.01)';
        });
        card.addEventListener('mouseleave', function() {
          this.style.background = '#f8f9fa';
          this.style.transform = 'scale(1)';
        });
        card.addEventListener('click', function() {
          const deptId = this.dataset.deptId;
          const deptName = this.dataset.deptName;
          closeModal();
          if (window.navigateToDepartment) {
            window.navigateToDepartment(deptId, deptName);
          }
        });
      });
    }
  } catch (error) {
    showAlert(error.message || 'Error al cargar detalles del centro');
  }
}

export async function createWorkCenter(data) {
  try {
    const response = await api.post('/work-centers', data);
    if (response.success) {
      showAlert('Centro de trabajo creado correctamente', 'success');
      await loadWorkCenters();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al crear centro');
    return false;
  }
}

export async function updateWorkCenter(id, data) {
  try {
    const response = await api.put(`/work-centers/${id}`, data);
    if (response.success) {
      showAlert('Centro actualizado correctamente', 'success');
      await loadWorkCenters();
      return true;
    }
  } catch (error) {
    showAlert(error.message || 'Error al actualizar centro');
    return false;
  }
}

export async function deleteWorkCenter(id) {
  showConfirm(
    'Esta seguro de eliminar este centro de trabajo?',
    async () => {
      try {
        const response = await api.delete(`/work-centers/${id}`);
        if (response.success) {
          showAlert('Centro eliminado correctamente', 'success');
          await loadWorkCenters();
        }
      } catch (error) {
        showAlert(error.message || 'Error al eliminar centro');
      }
    }
  );
}

export function showWorkCenterForm(id = null) {
  const isEdit = !!id;
  const title = isEdit ? 'Editar Centro de Trabajo' : 'Nuevo Centro de Trabajo';

  let wcData = {};
  if (isEdit) {
    const wc = state.workCenters.find(w => w._id === id);
    if (wc) wcData = wc;
  }

  const formHtml = `
    <form id="work-center-form">
      <div class="form-group">
        <label>Nombre del Centro</label>
        <input type="text" id="wcf-nombre" value="${wcData.nombre || ''}" required>
      </div>
      <div class="form-group">
        <label>Ubicacion</label>
        <input type="text" id="wcf-ubicacion" value="${wcData.ubicacion || ''}" required>
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

  document.getElementById('work-center-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('wcf-nombre').value.trim();
    const ubicacion = document.getElementById('wcf-ubicacion').value.trim();

    if (!nombre || !ubicacion) {
      showAlert('Todos los campos son obligatorios');
      return;
    }

    let success;
    if (isEdit) {
      success = await updateWorkCenter(id, { nombre, ubicacion });
    } else {
      success = await createWorkCenter({ nombre, ubicacion });
    }

    if (success) closeModal();
  });
}

window.loadWorkCenters = loadWorkCenters;
window.renderWorkCenters = renderWorkCenters;
window.filterWorkCenters = filterWorkCenters;
window.showWorkCenterDetail = showWorkCenterDetail;
window.editWorkCenter = showWorkCenterForm;
window.deleteWorkCenter = deleteWorkCenter;