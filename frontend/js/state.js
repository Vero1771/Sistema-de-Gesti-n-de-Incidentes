export const state = {
  token: localStorage.getItem('token'),
  user: null,
  currentTab: 'workers',
  workers: [],
  departments: [],
  workCenters: [],
  reports: [],
  filteredWorkers: [],
  filteredDepartments: [],
  filteredWorkCenters: [],
  filteredReports: [],
  selectedWorkerId: null,
  selectedDepartmentId: null,
  selectedWorkCenterId: null,
  selectedReportId: null,
  isLoading: false
};

export function updateState(newState) {
  Object.assign(state, newState);
}

export function getState() {
  return state;
}

// Exponer globalmente
window.state = state;
window.updateState = updateState;
window.getState = getState;