const { Descuento } = require('../models');
const descuentoService = require('../services/descuento.service');

exports.crearDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.create(req.body);
    res.status(201).json(descuento);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al crear el descuento', 
      error: error.message 
    });
  }
};

exports.obtenerDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.findAll({
      where: { estado: 'activo' }
    });
    res.json(descuentos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener los descuentos', 
      error: error.message 
    });
  }
};

exports.obtenerDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    res.json(descuento);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener el descuento', 
      error: error.message 
    });
  }
};

exports.actualizarDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    await descuento.update(req.body);
    res.json(descuento);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar el descuento', 
      error: error.message 
    });
  }
};

exports.eliminarDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    await descuento.update({ estado: 'inactivo' });
    res.json({ message: 'Descuento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar el descuento', 
      error: error.message 
    });
  }
};

exports.validarDescuento = async (req, res) => {
  try {
    const { venta } = req.body;
    const descuento = await Descuento.findByPk(req.params.id);
    
    if (!descuento) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }

    const descuentoCalculado = await descuentoService.calcularDescuento(venta, [descuento]);
    res.json(descuentoCalculado);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al validar el descuento', 
      error: error.message 
    });
  }
};
