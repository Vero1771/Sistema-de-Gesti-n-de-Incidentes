const mongoose = require('mongoose');

const WorkCenterSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del centro es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [100, 'No puede exceder 100 caracteres']
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es obligatoria'],
    trim: true,
    maxlength: [200, 'No puede exceder 200 caracteres']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkCenter', WorkCenterSchema);