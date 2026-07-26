import { state } from './state.js';
import { api } from './api.js';
import { loadComponents } from './loadComponents.js';
import { updateAuthUI } from './auth.js';
import { closeModal } from './utils/ui.js';

const PAGES = {
  workers: {
    file: 'workers.html',
    setup: () => {
      import('./components/workers.js').then(module => {
        module.loadWorkers();
        const addBtn = document.getElementById('btn-add-worker');
        if (addBtn) addBtn.addEventListener('click', module.showWorkerForm);
        const searchInput = document.getElementById('search-workers');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => module.filterWorkers(e.target.value));
        }
      });
    }
  },
  departments: {
    file: 'departments.html',
    setup: () => {
      import('./components/departments.js').then(module => {
        module.loadDepartments();
        const addBtn = document.getElementById('btn-add-department');
        if (addBtn) addBtn.addEventListener('click', module.showDepartmentForm);
        const searchInput = document.getElementById('search-departments');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => module.filterDepartments(e.target.value));
        }
      });
    }
  },
  'work-centers': {
    file: 'workCenters.html',
    setup: () => {
      import('./components/workCenters.js').then(module => {
        module.loadWorkCenters();
        const addBtn = document.getElementById('btn-add-work-center');
        if (addBtn) addBtn.addEventListener('click', module.showWorkCenterForm);
        const searchInput = document.getElementById('search-work-centers');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => module.filterWorkCenters(e.target.value));
        }
      });
    }
  },
  reports: {
    file: 'reports.html',
    setup: () => {
      import('./components/reports.js').then(module => {
        module.loadReports();
        const addBtn = document.getElementById('btn-add-report');
        if (addBtn) addBtn.addEventListener('click', module.showReportForm);
        const searchInput = document.getElementById('search-reports');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => module.filterReports(e.target.value));
        }
      });
    }
  }
};

let currentPage = 'workers';

export async function loadPage(page) {
  currentPage = page;
  
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === page);
  });

  const container = document.getElementById('page-content');
  const pageConfig = PAGES[page];
  
  if (pageConfig) {
    try {
      const response = await fetch(`../pages/${pageConfig.file}`);
      const html = await response.text();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const content = tempDiv.querySelector('.page-container');
      
      if (content) {
        container.innerHTML = `<div class="tab-content active">${content.innerHTML}</div>`;
      } else {
        container.innerHTML = `<div class="tab-content active"><p class="loading">Error al cargar la página</p></div>`;
      }
      
      setTimeout(() => {
        if (pageConfig.setup) pageConfig.setup();
      }, 100);
      
    } catch (error) {
      console.error('Error loading page:', error);
      container.innerHTML = `<div class="tab-content active"><p class="loading">Error al cargar la página</p></div>`;
    }
  }
}

function setupWorkersPage() {
  const addBtn = document.getElementById('btn-add-worker');
  if (addBtn) addBtn.addEventListener('click', () => showWorkerForm());

  const searchInput = document.getElementById('search-workers');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterWorkers(e.target.value));
  }

  loadWorkers();
}

function setupDepartmentsPage() {
  const addBtn = document.getElementById('btn-add-department');
  if (addBtn) addBtn.addEventListener('click', () => showDepartmentForm());

  const searchInput = document.getElementById('search-departments');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterDepartments(e.target.value));
  }

  loadDepartments();
}

function setupWorkCentersPage() {
  const addBtn = document.getElementById('btn-add-work-center');
  if (addBtn) addBtn.addEventListener('click', () => showWorkCenterForm());

  const searchInput = document.getElementById('search-work-centers');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterWorkCenters(e.target.value));
  }

  loadWorkCenters();
}

function setupReportsPage() {
  const addBtn = document.getElementById('btn-add-report');
  if (addBtn) addBtn.addEventListener('click', () => showReportForm());

  const searchInput = document.getElementById('search-reports');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterReports(e.target.value));
  }

  loadReports();
}

window.loadPage = loadPage;

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  
  setTimeout(() => {
    if (window.hideLoader) window.hideLoader();
  }, 500);

  const menuToggle = document.getElementById('menu-toggle');
  const navContainer = document.getElementById('nav-container');
  if (menuToggle && navContainer) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navContainer.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      const mainNav = document.querySelector('.main-nav');
      if (mainNav && !mainNav.contains(e.target)) {
        navContainer.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('active');
      }
    });
  }

  if (state.token) {
    api.setToken(state.token);
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        state.user = response.data.user;
        updateAuthUI();
        loadPage('workers');
      }
    } catch {
      state.token = null;
      localStorage.removeItem('token');
      api.setToken(null);
      updateAuthUI();
      loadPage('workers');
    }
  } else {
    updateAuthUI();
    loadPage('workers');
  }
});

window.closeModal = function() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  const workerModal = document.getElementById('worker-detail-modal');
  if (workerModal) workerModal.style.display = 'none';
  document.body.classList.remove('modal-open');
};

window.navigateToDepartment = function(deptId, deptName) {
  loadPage('departments');
  setTimeout(() => {
    const searchInput = document.getElementById('search-departments');
    if (searchInput) {
      searchInput.value = deptName;
      searchInput.dispatchEvent(new Event('input'));
    }
    setTimeout(() => {
      const rows = document.querySelectorAll('#departments-tbody .clickable-row');
      for (let row of rows) {
        if (row.dataset.id === deptId) {
          row.click();
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 400);
  }, 300);
};

window.navigateToWorkerList = function(deptId, deptName) {
  loadPage('workers');
  setTimeout(() => {
    const searchInput = document.getElementById('search-workers');
    if (searchInput) {
      searchInput.value = deptName;
      searchInput.dispatchEvent(new Event('input'));
    }
    if (window.showAlert) {
      window.showAlert('Mostrando trabajadores de: ' + deptName, 'success');
    }
  }, 300);
};