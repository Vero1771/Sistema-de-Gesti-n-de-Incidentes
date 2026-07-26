const Department = require('../models/Department');
const Worker = require('../models/Worker');

const createDepartment = async (req, res) => {
  try {
    const existing = await Department.findOne({ nombre: req.body.nombre });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE',
        message: 'Ya existe un departamento con ese nombre'
      });
    }

    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { activo: true };

    if (search) {
      query.nombre = { $regex: search, $options: 'i' };
    }

    const departments = await Department.find(query).sort({ nombre: 1 });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      activo: true
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Departamento no encontrado'
      });
    }

    const workers = await Worker.find({
      departmentId: department._id,
      activo: true
    })
    .populate('workCenterId', 'nombre ubicacion')
    .sort({ primer_apellido: 1 });

    res.json({
      success: true,
      data: {
        department,
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

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Departamento no encontrado'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Departamento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Departamento eliminado correctamente'
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
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};