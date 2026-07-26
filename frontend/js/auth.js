import { state } from './state.js';
import { api } from './api.js';

export function updateAuthUI() {
  const isLoggedIn = !!(state.token && state.user);

  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const userName = document.getElementById('user-name');
  const userNameText = document.getElementById('user-name-text');
  const dropdown = document.getElementById('user-dropdown');

  // Botones de login/register - se ocultan cuando hay sesion
  if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
  if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';

  // Nombre de usuario - solo visible con sesion
  if (isLoggedIn && userName && userNameText) {
    userName.style.display = 'flex';
    userNameText.textContent = state.user.nombre;
  } else if (userName) {
    userName.style.display = 'none';
  }

  // Configurar dropdown al hacer clic en el nombre
  if (userName) {
    // Remover eventos anteriores
    const newUserName = userName.cloneNode(true);
    userName.parentNode.replaceChild(newUserName, userName);
    
    newUserName.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdownEl = document.getElementById('user-dropdown');
      if (dropdownEl) {
        dropdownEl.classList.toggle('show');
      }
    });

    // Configurar boton de cerrar sesion dentro del dropdown
    const logoutDropdown = document.getElementById('btn-logout-dropdown');
    if (logoutDropdown) {
      logoutDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        if (window.handleLogout) window.handleLogout();
      });
    }
  }

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function(e) {
    const userNameEl = document.getElementById('user-name');
    const dropdownEl = document.getElementById('user-dropdown');
    if (dropdownEl && userNameEl && !userNameEl.contains(e.target)) {
      dropdownEl.classList.remove('show');
    }
  });
}

export async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const nombre = document.getElementById('auth-nombre').value.trim();
  const isRegister = document.getElementById('auth-submit').textContent.includes('Registrarse');

  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.style.display = 'none';

  try {
    if (window.showLoader) window.showLoader();

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister ? { nombre, email, password } : { email, password };

    const response = await api.post(endpoint, body);

    state.token = response.data.token;
    state.user = response.data.user;
    localStorage.setItem('token', state.token);
    api.setToken(state.token);

    updateAuthUI();
    closeAuthModal();
    
    if (window.showAlert) {
      window.showAlert(isRegister ? 'Registro exitoso' : 'Inicio de sesion exitoso', 'success');
    }

    if (window.loadPage) window.loadPage('workers');

  } catch (error) {
    if (errorEl) {
      errorEl.textContent = error.message || 'Error en la autenticacion';
      errorEl.style.display = 'block';
    }
    if (window.showAlert) {
      window.showAlert(error.message || 'Error en la autenticacion');
    }
  } finally {
    if (window.hideLoader) window.hideLoader();
  }
}

export function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  api.setToken(null);
  updateAuthUI();
  
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('show');
  
  if (window.showAlert) {
    window.showAlert('Sesion cerrada', 'success');
  }
  
  if (window.loadPage) window.loadPage('workers');
}

export function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-title');
  const submit = document.getElementById('auth-submit');
  const nameGroup = document.getElementById('auth-name-group');
  const errorEl = document.getElementById('auth-error');

  if (!modal) return;

  if (errorEl) errorEl.style.display = 'none';

  if (mode === 'login') {
    title.textContent = 'Iniciar Sesion';
    submit.innerHTML = '<img src="../icons/lock.svg" alt="Login" class="btn-icon"> Iniciar Sesion';
    nameGroup.style.display = 'none';
    const nombreInput = document.getElementById('auth-nombre');
    if (nombreInput) nombreInput.removeAttribute('required');
  } else {
    title.textContent = 'Registrarse';
    submit.innerHTML = '<img src="../icons/add.svg" alt="Register" class="btn-icon"> Registrarse';
    nameGroup.style.display = 'block';
    const nombreInput = document.getElementById('auth-nombre');
    if (nombreInput) nombreInput.setAttribute('required', 'required');
  }

  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const nombreInput = document.getElementById('auth-nombre');
  
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (nombreInput) nombreInput.value = '';

  modal.style.display = 'block';
  document.body.classList.add('modal-open');
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.classList.remove('modal-open');
  
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.style.display = 'none';
}

// Exponer funciones globalmente
window.updateAuthUI = updateAuthUI;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;