export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function getFullName(primerNombre, segundoNombre, primerApellido, segundoApellido) {
  const parts = [
    primerNombre || '',
    segundoNombre || '',
    primerApellido || '',
    segundoApellido || ''
  ];
  return parts.filter(p => p).join(' ');
}

export function getInitials(primerNombre, primerApellido) {
  return `${(primerNombre || '')[0]}${(primerApellido || '')[0]}`.toUpperCase();
}

export function getStatusColor(status) {
  const colors = {
    'pendiente': '#f39c12',
    'en_revision': '#3498db',
    'resuelto': '#27ae60',
    'cerrado': '#95a5a6'
  };
  return colors[status] || '#95a5a6';
}

export function getSeverityColor(severity) {
  const colors = {
    'baja': '#27ae60',
    'media': '#f39c12',
    'alta': '#e67e22',
    'critica': '#e74c3c'
  };
  return colors[severity] || '#95a5a6';
}