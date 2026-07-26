const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const departmentSchema = Joi.object({
  nombre: Joi.string().min(1).max(100).required()
});

const updateDepartmentSchema = departmentSchema.fork(
  ['nombre'],
  (schema) => schema.optional()
);

router.use(authenticate);

router.post('/', validate(departmentSchema), createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;