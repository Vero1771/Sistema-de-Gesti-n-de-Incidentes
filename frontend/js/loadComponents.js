export async function loadComponents() {
  try {
    const headerResponse = await fetch('../components/header.html');
    const headerHtml = await headerResponse.text();
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;

    const navResponse = await fetch('../components/nav.html');
    const navHtml = await navResponse.text();
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) navPlaceholder.innerHTML = navHtml;

    const footerResponse = await fetch('../components/footer.html');
    const footerHtml = await footerResponse.text();
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

    setupAuthEvents();
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

function setupAuthEvents() {
  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const authCancel = document.getElementById('auth-cancel');
  const authClose = document.getElementById('auth-modal-close');
  const authForm = document.getElementById('auth-form');

  // Boton Iniciar Sesion
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      if (window.openAuthModal) window.openAuthModal('login');
    });
  }

  // Boton Registrarse
  if (registerBtn) {
    registerBtn.addEventListener('click', function() {
      if (window.openAuthModal) window.openAuthModal('register');
    });
  }

  // BOTON CANCELAR - CIERRA EL MODAL
  if (authCancel) {
    authCancel.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.closeAuthModal) {
        window.closeAuthModal();
      }
    });
  }

  // BOTON CERRAR (X) - CIERRA EL MODAL
  if (authClose) {
    authClose.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.closeAuthModal) {
        window.closeAuthModal();
      }
    });
  }

  // FORMULARIO
  if (authForm) {
    authForm.addEventListener('submit', function(e) {
      if (window.handleLogin) window.handleLogin(e);
    });
  }

  // Cerrar modal al hacer click fuera
  const authModal = document.getElementById('auth-modal');
  const mainModal = document.getElementById('modal');

  document.addEventListener('click', function(e) {
    if (e.target === authModal && window.closeAuthModal) {
      window.closeAuthModal();
    }
    if (e.target === mainModal && window.closeModal) {
      window.closeModal();
    }
  });
}