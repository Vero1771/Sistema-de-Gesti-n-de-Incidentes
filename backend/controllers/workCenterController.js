const WorkCenter = require('../models/WorkCenter');
const Worker = require('../models/Worker');

const createWorkCenter = async (req, res) => {
  try {
    const existing = await WorkCenter.findOne({ nombre: req.body.nombre });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE',
        message: 'Ya existe un centro con ese nombre'
      });
    }

    const workCenter = await WorkCenter.create(req.body);
    res.status(201).json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getWorkCenters = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { activo: true };

    if (search) {
      query = {
        ...query,
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { ubicacion: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const workCenters = await WorkCenter.find(query).sort({ nombre: 1 });

    res.json({
      success: true,
      data: workCenters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getWorkCenterById = async (req, res) => {
  try {
    const workCenter = await WorkCenter.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Centro de trabajo no encontrado'
      });
    }

    const workers = await Worker.find({
      workCenterId: workCenter._id,
      activo: true
    })
    .populate('departmentId', 'nombre')
    .sort({ primer_apellido: 1 });

    res.json({
      success: true,
      data: {
        workCenter,
        workers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const updateWorkCenter = async (req, res) => {
  try {
    const workCenter = await WorkCenter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Centro de trabajo no encontrado'
      });
    }

    res.json({
      success: true,
      data: workCenter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const deleteWorkCenter = async (req, res) => {
  try {
    const workCenter = await WorkCenter.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!workCenter) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Centro de trabajo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Centro de trabajo eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

module.exports = {
  createWorkCenter,
  getWorkCenters,
  getWorkCenterById,
  updateWorkCenter,
  deleteWorkCenter
};