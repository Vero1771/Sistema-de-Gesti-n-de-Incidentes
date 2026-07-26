const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createWorkCenter,
  getWorkCenters,
  getWorkCenterById,
  updateWorkCenter,
  deleteWorkCenter
} = require('../controllers/workCenterController');

const workCenterSchema = Joi.object({
  nombre: Joi.string().min(1).max(100).required(),
  ubicacion: Joi.string().min(1).max(200).required()
});

const updateWorkCenterSchema = workCenterSchema.fork(
  ['nombre', 'ubicacion'],
  (schema) => schema.optional()
);

router.use(authenticate);

router.post('/', validate(workCenterSchema), createWorkCenter);
router.get('/', getWorkCenters);
router.get('/:id', getWorkCenterById);
router.put('/:id', validate(updateWorkCenterSchema), updateWorkCenter);
router.delete('/:id', authorize('admin'), deleteWorkCenter);

module.exports = router;