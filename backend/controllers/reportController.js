const Report = require('../models/Report');
const Worker = require('../models/Worker');

const createReport = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      _id: req.body.workerId,
      activo: true
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'WORKER_NOT_FOUND',
        message: 'Trabajador no encontrado'
      });
    }

    const reportData = {
      ...req.body,
      userId: req.user.id
    };

    if (req.body.evidenciaData) {
      reportData.evidenciaData = req.body.evidenciaData;
      reportData.evidenciaTipo = req.body.evidenciaTipo || 'image/png';
      reportData.evidencias = req.body.evidencias || 'evidencia_' + Date.now();
    }

    const report = await Report.create(reportData);
    const populatedReport = await Report.findById(report._id)
      .populate('workerId', 'primer_nombre primer_apellido cedula email telefono');

    res.status(201).json({
      success: true,
      data: populatedReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getReports = async (req, res) => {
  try {
    const { tipo, estado, workerId, search } = req.query;
    let query = { activo: true };

    if (tipo) query.tipo = tipo;
    if (estado) query.estado = estado;
    if (workerId) query.workerId = workerId;

    if (search) {
      const workers = await Worker.find({
        $text: { $search: search },
        activo: true
      }, { _id: 1 });
      
      const workerIds = workers.map(w => w._id);
      if (workerIds.length > 0) {
        query.workerId = { $in: workerIds };
      }
    }

    const reports = await Report.find(query)
      .populate('workerId', 'primer_nombre primer_apellido cedula email telefono')
      .sort({ fecha_reporte: -1 });

    const cleanReports = reports.map(r => {
      const obj = r.toObject();
      if (obj.evidenciaData) {
        obj.evidenciaData = obj.evidenciaData.substring(0, 50) + '...';
      }
      return obj;
    });

    res.json({
      success: true,
      data: cleanReports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      activo: true
    })
    .populate('workerId', 'primer_nombre primer_apellido cedula email telefono');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting report by id:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const updateReport = async (req, res) => {
  try {
    if (req.body.workerId) {
      const worker = await Worker.findOne({
        _id: req.body.workerId,
        activo: true
      });
      if (!worker) {
        return res.status(404).json({
          success: false,
          error: 'WORKER_NOT_FOUND',
          message: 'Trabajador no encontrado'
        });
      }
    }

    const updateData = { ...req.body };
    
    if (req.body.evidenciaData) {
      updateData.evidenciaData = req.body.evidenciaData;
      updateData.evidenciaTipo = req.body.evidenciaTipo || 'image/png';
      updateData.evidencias = req.body.evidencias || 'evidencia_' + Date.now();
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('workerId', 'primer_nombre primer_apellido cedula');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Reporte eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
};