const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Worker = require('../models/Worker');

router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({ activo: true })
      .populate('workerId', 'primer_nombre primer_apellido cedula')
      .sort({ fecha_reporte: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const worker = await Worker.findOne({ _id: req.body.workerId, activo: true });
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'WORKER_NOT_FOUND',
        message: 'Trabajador no encontrado'
      });
    }

    console.log('Datos recibidos:', {
      titulo: req.body.titulo,
      tipo: req.body.tipo,
      tieneImagen: !!req.body.evidenciaData,
      tamanioImagen: req.body.evidenciaData ? req.body.evidenciaData.length : 0
    });

    const report = await Report.create(req.body);
    const populatedReport = await Report.findById(report._id)
      .populate('workerId', 'primer_nombre primer_apellido cedula');

    res.status(201).json({ success: true, data: populatedReport });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, activo: true })
      .populate('workerId', 'primer_nombre primer_apellido cedula');
    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Reporte no encontrado' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Actualizando reporte:', req.params.id);
    console.log('Datos recibidos:', {
      titulo: req.body.titulo,
      tipo: req.body.tipo,
      tieneImagen: !!req.body.evidenciaData,
      tamanioImagen: req.body.evidenciaData ? req.body.evidenciaData.length : 0
    });

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('workerId', 'primer_nombre primer_apellido');

    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Reporte no encontrado' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Reporte no encontrado' });
    }
    res.json({ success: true, message: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

module.exports = router;