const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'El trabajador es obligatorio']
  },
  titulo: {
    type: String,
    required: [true, 'El titulo es obligatorio'],
    trim: true,
    maxlength: [200, 'No puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripcion es obligatoria'],
    trim: true,
    maxlength: [2000, 'No puede exceder 2000 caracteres']
  },
  tipo: {
    type: String,
    enum: ['incidente', 'accidente', 'riesgo', 'capacitacion', 'visita', 'otro'],
    required: [true, 'El tipo de reporte es obligatorio']
  },
  severidad: {
    type: String,
    enum: ['baja', 'media', 'alta', 'critica'],
    default: 'media'
  },
  fecha_reporte: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_revision', 'resuelto', 'cerrado'],
    default: 'pendiente'
  },
  evidencias: {
    type: String,
    trim: true,
    default: null
  },
  evidenciaData: {
    type: String,
    default: null
  },
  evidenciaTipo: {
    type: String,
    default: null
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);