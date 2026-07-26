const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del departamento es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [100, 'No puede exceder 100 caracteres']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', DepartmentSchema);