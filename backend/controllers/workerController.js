const Worker = require('../models/Worker');
const Department = require('../models/Department');
const WorkCenter = require('../models/WorkCenter');
const Report = require('../models/Report');

const createWorker = async (req, res) => {
  try {
    const { cedula, numero_trabajador, departmentId, workCenterId, email } = req.body;

    // Verificar cédula única
    const existingCedula = await Worker.findOne({ cedula });
    if (existingCedula) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_CEDULA',
        message: 'Ya existe un trabajador con esa cédula'
      });
    }

    // Verificar número de trabajador único
    const existingNumero = await Worker.findOne({ numero_trabajador });
    if (existingNumero) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_NUMERO',
        message: 'Ya existe un trabajador con ese número'
      });
    }

    // Verificar email único (si se proporcionó)
    if (email) {
      const existingEmail = await Worker.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: 'Ya existe un trabajador con ese email'
        });
      }
    }

    // Verificar departamento
    const department = await Department.findOne({ _id: departmentId, activo: true });
    if (!department) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DEPARTMENT',
        message: 'El departamento seleccionado no existe'
      });
    }

    // Verificar centro de trabajo
    const workCenter = await WorkCenter.findOne({ _id: workCenterId, activo: true });
    if (!workCenter) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_WORK_CENTER',
        message: 'El centro de trabajo seleccionado no existe'
      });
    }

    // Limpiar datos antes de guardar
    const cleanData = {
      primer_nombre: req.body.primer_nombre.trim(),
      segundo_nombre: req.body.segundo_nombre ? req.body.segundo_nombre.trim() : null,
      primer_apellido: req.body.primer_apellido.trim(),
      segundo_apellido: req.body.segundo_apellido.trim(),
      cedula: req.body.cedula.trim(),
      numero_trabajador: req.body.numero_trabajador.trim(),
      email: req.body.email ? req.body.email.trim().toLowerCase() : null,
      telefono: req.body.telefono ? req.body.telefono.trim() : null,
      genero: req.body.genero || 'prefiero_no_decir',
      departmentId: req.body.departmentId,
      workCenterId: req.body.workCenterId,
      cargo: req.body.cargo.trim(),
      fecha_nacimiento: req.body.fecha_nacimiento,
      fecha_ingreso: req.body.fecha_ingreso
    };

    const worker = await Worker.create(cleanData);
    const populatedWorker = await Worker.findById(worker._id)
      .populate('departmentId', 'nombre')
      .populate('workCenterId', 'nombre ubicacion');

    res.status(201).json({
      success: true,
      data: populatedWorker
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getWorkers = async (req, res) => {
  try {
    const { search, department, workCenter } = req.query;
    let query = { activo: true };

    if (search) {
      query = {
        ...query,
        $text: { $search: search }
      };
    }

    if (department) {
      const dept = await Department.findOne({ 
        nombre: { $regex: department, $options: 'i' } 
      });
      if (dept) query.departmentId = dept._id;
    }

    if (workCenter) {
      const wc = await WorkCenter.findOne({ 
        nombre: { $regex: workCenter, $options: 'i' } 
      });
      if (wc) query.workCenterId = wc._id;
    }

    const workers = await Worker.find(query)
      .populate('departmentId', 'nombre')
      .populate('workCenterId', 'nombre ubicacion')
      .sort({ primer_apellido: 1, primer_nombre: 1 });

    res.json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Error getting workers:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      _id: req.params.id,
      activo: true
    })
    .populate('departmentId', 'nombre')
    .populate('workCenterId', 'nombre ubicacion');

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Trabajador no encontrado'
      });
    }

    const reports = await Report.find({ 
      workerId: worker._id, 
      activo: true 
    })
    .sort({ fecha_reporte: -1 });

    res.json({
      success: true,
      data: {
        worker,
        reports
      }
    });
  } catch (error) {
    console.error('Error getting worker by id:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Trabajador no encontrado'
      });
    }

    // Construir objeto de actualización solo con campos enviados
    const updateData = {};
    const fields = ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 
                    'cedula', 'numero_trabajador', 'email', 'telefono', 'genero', 
                    'departmentId', 'workCenterId', 'cargo', 'fecha_nacimiento', 'fecha_ingreso'];
    
    for (let field of fields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'string') {
          updateData[field] = req.body[field].trim() || null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    // Verificar email único (si se está actualizando)
    if (updateData.email && updateData.email !== worker.email) {
      const existingEmail = await Worker.findOne({ 
        email: updateData.email,
        _id: { $ne: req.params.id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: 'Ya existe otro trabajador con ese email'
        });
      }
    }

    // Verificar cédula única
    if (updateData.cedula && updateData.cedula !== worker.cedula) {
      const existingCedula = await Worker.findOne({ 
        cedula: updateData.cedula,
        _id: { $ne: req.params.id }
      });
      if (existingCedula) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_CEDULA',
          message: 'Ya existe otro trabajador con esa cédula'
        });
      }
    }

    // Verificar número de trabajador único
    if (updateData.numero_trabajador && updateData.numero_trabajador !== worker.numero_trabajador) {
      const existingNumero = await Worker.findOne({ 
        numero_trabajador: updateData.numero_trabajador,
        _id: { $ne: req.params.id }
      });
      if (existingNumero) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_NUMERO',
          message: 'Ya existe otro trabajador con ese número'
        });
      }
    }

    // Verificar departamento
    if (updateData.departmentId) {
      const department = await Department.findOne({ 
        _id: updateData.departmentId, 
        activo: true 
      });
      if (!department) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DEPARTMENT',
          message: 'El departamento seleccionado no existe'
        });
      }
    }

    // Verificar centro de trabajo
    if (updateData.workCenterId) {
      const workCenter = await WorkCenter.findOne({ 
        _id: updateData.workCenterId, 
        activo: true 
      });
      if (!workCenter) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_WORK_CENTER',
          message: 'El centro de trabajo seleccionado no existe'
        });
      }
    }

    // Si no hay datos para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_DATA',
        message: 'No hay datos para actualizar'
      });
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('departmentId', 'nombre')
    .populate('workCenterId', 'nombre ubicacion');

    res.json({
      success: true,
      data: updatedWorker
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Trabajador no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Trabajador eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getWorkerReports = async (req, res) => {
  try {
    const reports = await Report.find({
      workerId: req.params.id,
      activo: true
    })
    .sort({ fecha_reporte: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error getting worker reports:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

module.exports = {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkerReports
};