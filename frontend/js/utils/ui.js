export function showLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.remove('hidden');
}

export function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.add('hidden');
}

export function showAlert(message, type = 'error') {
  const alertDiv = document.createElement('div');
  alertDiv.className = type === 'error' ? 'error-message' : 'success-message';
  alertDiv.innerHTML = `
    <img src="../icons/${type === 'error' ? 'close' : 'check'}.svg" alt="" class="inline-icon">
    ${message}
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.animation = 'slideInRight 0.4s ease reverse';
    setTimeout(() => alertDiv.remove(), 400);
  }, 3000);
}

export function showModal(title, content) {
  const modal = document.getElementById('modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  
  if (!modal || !titleEl || !bodyEl) return;
  
  titleEl.textContent = title;
  bodyEl.innerHTML = content;
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  const workerModal = document.getElementById('worker-detail-modal');
  if (workerModal) workerModal.style.display = 'none';
  document.body.classList.remove('modal-open');
}

export function setupSearch(inputId, handler) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => handler(input.value), 300);
  });
}

export function showConfirm(message, onConfirm, onCancel = null) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  if (!modal || !title || !body) return;

  title.textContent = 'Confirmar';
  body.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${message}</p>
      <div class="form-actions" style="justify-content: center; gap: 15px;">
        <button class="btn-cancel" onclick="window._confirmCancel()">Cancelar</button>
        <button class="btn-danger" onclick="window._confirmOk()">
          <img src="../icons/delete.svg" alt="Delete" class="btn-icon">
          Eliminar
        </button>
      </div>
    </div>
  `;
  modal.style.display = 'block';
  document.body.classList.add('modal-open');

  window._confirmOk = () => {
    closeModal();
    if (onConfirm) onConfirm();
  };
  window._confirmCancel = () => {
    closeModal();
    if (onCancel) onCancel();
  };
}

window.showLoader = showLoader;
window.hideLoader = hideLoader;
window.showAlert = showAlert;
window.showModal = showModal;
window.closeModal = closeModal;
window.setupSearch = setupSearch;
window.showConfirm = showConfirm;