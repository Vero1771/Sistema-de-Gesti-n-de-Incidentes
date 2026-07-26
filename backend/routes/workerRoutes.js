const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkerReports
} = require('../controllers/workerController');


//  ESQUEMAS DE VALIDACIÓN - CORREGIDOS

const workerSchema = Joi.object({
  primer_nombre: Joi.string().min(1).max(50).required(),
  segundo_nombre: Joi.string().max(50).allow(null, '').optional(),
  primer_apellido: Joi.string().min(1).max(50).required(),
  segundo_apellido: Joi.string().min(1).max(50).required(),
  cedula: Joi.string().pattern(/^\d{8}$/).required(),
  numero_trabajador: Joi.string().required(),
  email: Joi.string().email().allow(null, '').optional(),
  telefono: Joi.string().pattern(/^(\+?\d{1,3}[- ]?)?\d{10,15}$/).allow(null, '').optional(),
  genero: Joi.string().valid('masculino', 'femenino', 'otro', 'prefiero_no_decir').allow(null, '').optional(),
  departmentId: Joi.string().required(),
  workCenterId: Joi.string().required(),
  cargo: Joi.string().min(1).max(100).required(),
  fecha_nacimiento: Joi.date().iso().required(),
  fecha_ingreso: Joi.date().iso().required()
});

const updateWorkerSchema = Joi.object({
  primer_nombre: Joi.string().min(1).max(50).optional(),
  segundo_nombre: Joi.string().max(50).allow(null, '').optional(),
  primer_apellido: Joi.string().min(1).max(50).optional(),
  segundo_apellido: Joi.string().min(1).max(50).optional(),
  cedula: Joi.string().pattern(/^\d{8}$/).optional(),
  numero_trabajador: Joi.string().optional(),
  email: Joi.string().email().allow(null, '').optional(),
  telefono: Joi.string().pattern(/^(\+?\d{1,3}[- ]?)?\d{10,15}$/).allow(null, '').optional(),
  genero: Joi.string().valid('masculino', 'femenino', 'otro', 'prefiero_no_decir').allow(null, '').optional(),
  departmentId: Joi.string().optional(),
  workCenterId: Joi.string().optional(),
  cargo: Joi.string().min(1).max(100).optional(),
  fecha_nacimiento: Joi.date().iso().optional(),
  fecha_ingreso: Joi.date().iso().optional()
});


//  RUTAS

router.use(authenticate);

router.post('/', validate(workerSchema), createWorker);
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.get('/:id/reports', getWorkerReports);
router.put('/:id', validate(updateWorkerSchema), updateWorker);
router.delete('/:id', authorize('admin'), deleteWorker);

module.exports = router;