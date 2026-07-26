const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  primer_nombre: {
    type: String,
    required: [true, 'El primer nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'No puede exceder 50 caracteres']
  },
  segundo_nombre: {
    type: String,
    trim: true,
    maxlength: [50, 'No puede exceder 50 caracteres'],
    default: null
  },
  primer_apellido: {
    type: String,
    required: [true, 'El primer apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'No puede exceder 50 caracteres']
  },
  segundo_apellido: {
    type: String,
    required: [true, 'El segundo apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'No puede exceder 50 caracteres']
  },
  cedula: {
    type: String,
    required: [true, 'La cédula es obligatoria'],
    unique: true,
    match: [/^\d{8}$/, 'La cédula debe tener 8 dígitos']
  },
  numero_trabajador: {
    type: String,
    required: [true, 'El número de trabajador es obligatorio'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    default: null
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^(\+?\d{1,3}[- ]?)?\d{10,15}$/, 'Teléfono inválido'],
    default: null
  },
  genero: {
    type: String,
    enum: ['masculino', 'femenino', 'otro', 'prefiero_no_decir'],
    default: 'prefiero_no_decir'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'El departamento es obligatorio']
  },
  workCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: [true, 'El centro de trabajo es obligatorio']
  },
  cargo: {
    type: String,
    required: [true, 'El cargo es obligatorio'],
    trim: true,
    maxlength: [100, 'No puede exceder 100 caracteres']
  },
  fecha_nacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  fecha_ingreso: {
    type: Date,
    required: [true, 'La fecha de ingreso es obligatoria']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

WorkerSchema.index({ 
  primer_nombre: 'text', 
  primer_apellido: 'text', 
  cedula: 'text',
  email: 'text'
});

WorkerSchema.pre('save', function(next) {
  if (this.email === '') {
    this.email = null;
  }
  if (this.telefono === '') {
    this.telefono = null;
  }
  next();
});

module.exports = mongoose.model('Worker', WorkerSchema);