const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
require('moment/locale/es');

// Configurar locale de moment
moment.locale('es');

// Directorio para guardar comprobantes temporales
const COMPROBANTES_DIR = path.join(__dirname, '../../public/comprobantes');

// Asegurarse que el directorio existe
if (!fs.existsSync(COMPROBANTES_DIR)) {
  fs.mkdirSync(COMPROBANTES_DIR, { recursive: true });
}

/**
 * Genera un PDF con el comprobante de venta (ticket o factura)
 * @param {Object} venta - Objeto de venta con relaciones incluidas
 * @param {String} tipo - 'ticket' o 'factura'
 * @returns {Promise<Buffer>} - PDF como Buffer
 */
exports.generateTicketPDF = async (venta, tipo = 'ticket') => {
  return new Promise((resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new PDFDocument({
        size: tipo === 'ticket' ? [227, 800] : 'LETTER', // Tamaño según tipo (ticket térmico o carta)
        margin: tipo === 'ticket' ? 10 : 50,
        bufferPages: true
      });
      
      // Stream para generar el PDF en memoria
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Información de la empresa
      const empresa = {
        nombre: 'Refaccionaria Automotriz',
        direccion: 'Calle Principal 123, Ciudad',
        telefono: '(555) 123-4567',
        rfc: 'XAXX010101000',
        logo: path.join(__dirname, '../../public/images/logo.png')
      };
      
      // Añadir contenido según el tipo
      if (tipo === 'ticket') {
        generarTicket(doc, venta, empresa);
      } else {
        generarFactura(doc, venta, empresa);
      }
      
      // Finalizar documento
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera un ticket de venta en formato térmico
 * @param {PDFDocument} doc - Documento PDF
 * @param {Object} venta - Objeto de venta
 * @param {Object} empresa - Datos de la empresa
 */
function generarTicket(doc, venta, empresa) {
  const width = doc.page.width;
  
  // Encabezado del ticket
  doc.fontSize(12).font('Helvetica-Bold').text(empresa.nombre, { align: 'center' });
  doc.fontSize(8).font('Helvetica').text(empresa.direccion, { align: 'center' });
  doc.text(`Tel: ${empresa.telefono}`, { align: 'center' });
  doc.text(`RFC: ${empresa.rfc}`, { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(9).font('Helvetica-Bold').text('TICKET DE VENTA', { align: 'center' });
  doc.fontSize(8).font('Helvetica').text(`No. ${venta.id.toString().padStart(8, '0')}`, { align: 'center' });
  
  // Información de fecha y vendedor
  doc.moveDown();
  doc.fontSize(8).text(`Fecha: ${moment(venta.fecha_venta).format('DD/MM/YYYY HH:mm:ss')}`);
  doc.text(`Vendedor: ${venta.usuario.nombre}`);
  
  // Cliente
  if (venta.cliente) {
    doc.text(`Cliente: ${venta.cliente.nombre} ${venta.cliente.apellido || ''}`);
    if (venta.cliente.rfc) {
      doc.text(`RFC: ${venta.cliente.rfc}`);
    }
  } else {
    doc.text('Cliente: Público General');
  }
  
  // Línea separadora
  doc.moveDown(0.5);
  doc.strokeColor('#000000').lineWidth(1)
     .moveTo(10, doc.y).lineTo(width - 10, doc.y).stroke();
  
  // Encabezado de productos
  doc.moveDown(0.5);
  doc.fontSize(7).font('Helvetica-Bold');
  doc.text('CANT', 10, doc.y, { width: 25 });
  doc.text('DESCRIPCION', 35, doc.y, { width: 110 });
  doc.text('PRECIO', 145, doc.y, { width: 35, align: 'right' });
  doc.text('IMPORTE', 180, doc.y, { width: 37, align: 'right' });
  
  // Lista de productos
  doc.moveDown(0.5);
  doc.fontSize(7).font('Helvetica');
  
  venta.detalles.forEach(detalle => {
    const y = doc.y;
    doc.text(detalle.cantidad.toString(), 10, y, { width: 25 });
    doc.text(detalle.producto.nombre, 35, y, { width: 110 });
    doc.text(`$${detalle.precio_unitario.toFixed(2)}`, 145, y, { width: 35, align: 'right' });
    doc.text(`$${detalle.subtotal.toFixed(2)}`, 180, y, { width: 37, align: 'right' });
  });
  
  // Línea separadora
  doc.moveDown(0.5);
  doc.strokeColor('#000000').lineWidth(0.5)
     .moveTo(10, doc.y).lineTo(width - 10, doc.y).stroke();
  
  // Totales
  doc.moveDown(0.5);
  doc.fontSize(7).font('Helvetica');
  doc.text('SUBTOTAL:', 130, doc.y, { width: 50, align: 'right' });
  doc.text(`$${venta.subtotal.toFixed(2)}`, 180, doc.y, { width: 37, align: 'right' });
  
  doc.text('IVA:', 130, doc.y + 10, { width: 50, align: 'right' });
  doc.text(`$${venta.impuestos.toFixed(2)}`, 180, doc.y, { width: 37, align: 'right' });
  
  doc.fontSize(8).font('Helvetica-Bold');
  doc.text('TOTAL:', 130, doc.y + 15, { width: 50, align: 'right' });
  doc.text(`$${venta.total.toFixed(2)}`, 180, doc.y, { width: 37, align: 'right' });
  
  // Método de pago
  doc.moveDown();
  doc.fontSize(7).font('Helvetica');
  doc.text(`Forma de Pago: ${formatMetodoPago(venta.metodo_pago)}`);
  
  // Pie del ticket
  doc.moveDown(2);
  doc.fontSize(7).font('Helvetica').text('GRACIAS POR SU COMPRA', { align: 'center' });
  doc.text('Este documento no es un comprobante fiscal', { align: 'center' });
  
  // Código QR o Código de Barras (simulado)
  doc.moveDown();
  doc.fontSize(7).text('*' + venta.id.toString().padStart(10, '0') + '*', { align: 'center' });
  
  // Ajustar tamaño del PDF según el contenido
  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    doc.switchToPage(i);
    if (i === pages.start + pages.count - 1) {
      const height = doc.y + 50; // Añadir espacio al final
      doc.page.height = height;
    }
  }
}

/**
 * Genera una factura completa
 * @param {PDFDocument} doc - Documento PDF
 * @param {Object} venta - Objeto de venta
 * @param {Object} empresa - Datos de la empresa
 */
function generarFactura(doc, venta, empresa) {
  // Logo si existe
  if (fs.existsSync(empresa.logo)) {
    doc.image(empresa.logo, 50, 50, { width: 100 });
  }
  
  // Encabezado con datos de la empresa
  doc.fontSize(16).font('Helvetica-Bold').text(empresa.nombre, 200, 50);
  doc.fontSize(10).font('Helvetica').text(empresa.direccion, 200, doc.y + 5);
  doc.text(`Tel: ${empresa.telefono}`, 200, doc.y + 5);
  doc.text(`RFC: ${empresa.rfc}`, 200, doc.y + 5);
  
  // Título de Factura
  doc.moveDown(2);
  doc.fontSize(14).font('Helvetica-Bold').text('FACTURA', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`No. ${venta.id.toString().padStart(8, '0')}`, { align: 'center' });
  
  // Información de fecha 
  doc.moveDown();
  doc.fontSize(10).text(`Fecha de emisión: ${moment(venta.fecha_venta).format('DD/MM/YYYY HH:mm:ss')}`);
  
  // Cuadro con datos del cliente
  doc.moveDown();
  doc.fontSize(12).font('Helvetica-Bold').text('Datos del Cliente');
  doc.fontSize(10).font('Helvetica');
  
  if (venta.cliente) {
    doc.text(`Nombre/Razón Social: ${venta.cliente.nombre} ${venta.cliente.apellido || ''}`);
    doc.text(`RFC: ${venta.cliente.rfc || 'Sin RFC'}`);
    if (venta.cliente.direccion) {
      doc.text(`Dirección: ${venta.cliente.direccion}`);
    }
    if (venta.cliente.email) {
      doc.text(`Email: ${venta.cliente.email}`);
    }
  } else {
    doc.text('Cliente: Público General');
    doc.text('RFC: XAXX010101000');
  }
  
  // Tabla de productos
  doc.moveDown(2);
  doc.fontSize(12).font('Helvetica-Bold').text('Productos');
  
  // Encabezado de tabla
  const tableTop = doc.y + 10;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Cantidad', 50, tableTop);
  doc.text('Descripción', 120, tableTop);
  doc.text('Precio Unit.', 350, tableTop, { width: 80, align: 'right' });
  doc.text('Importe', 430, tableTop, { width: 80, align: 'right' });
  
  // Línea después del encabezado
  doc.strokeColor('#000000').lineWidth(1)
     .moveTo(50, tableTop + 15).lineTo(510, tableTop + 15).stroke();
  
  // Contenido de la tabla
  let tableY = tableTop + 25;
  doc.fontSize(10).font('Helvetica');
  
  venta.detalles.forEach(detalle => {
    doc.text(detalle.cantidad.toString(), 50, tableY);
    doc.text(detalle.producto.nombre, 120, tableY);
    doc.text(`$${detalle.precio_unitario.toFixed(2)}`, 350, tableY, { width: 80, align: 'right' });
    doc.text(`$${detalle.subtotal.toFixed(2)}`, 430, tableY, { width: 80, align: 'right' });
    tableY += 20;
  });
  
  // Línea después de los productos
  doc.strokeColor('#000000').lineWidth(1)
     .moveTo(50, tableY).lineTo(510, tableY).stroke();
  
  // Totales
  tableY += 15;
  doc.fontSize(10).font('Helvetica');
  doc.text('Subtotal:', 350, tableY, { width: 80, align: 'right' });
  doc.text(`$${venta.subtotal.toFixed(2)}`, 430, tableY, { width: 80, align: 'right' });
  
  tableY += 20;
  doc.text('IVA (16%):', 350, tableY, { width: 80, align: 'right' });
  doc.text(`$${venta.impuestos.toFixed(2)}`, 430, tableY, { width: 80, align: 'right' });
  
  tableY += 20;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total:', 350, tableY, { width: 80, align: 'right' });
  doc.text(`$${venta.total.toFixed(2)}`, 430, tableY, { width: 80, align: 'right' });
  
  // Información de pago
  tableY += 40;
  doc.fontSize(10).font('Helvetica-Bold').text('Información de Pago', 50, tableY);
  tableY += 15;
  doc.fontSize(10).font('Helvetica');
  doc.text(`Forma de Pago: ${formatMetodoPago(venta.metodo_pago)}`, 50, tableY);
  
  // Notas y condiciones
  doc.moveDown(3);
  doc.fontSize(8).text('Este documento es una representación impresa de un CFDI (Comprobante Fiscal Digital por Internet)');

  // Pie de página con información legal y fiscal
  const pageHeight = doc.page.height;
  doc.fontSize(7).text(
    'La reproducción no autorizada de este comprobante constituye un delito en los términos de las disposiciones fiscales.',
    50, pageHeight - 50,
    { width: 500, align: 'center' }
  );
}

/**
 * Formatea el método de pago para mostrar en el comprobante
 * @param {String} metodo - Método de pago (efectivo, tarjeta, transferencia)
 * @returns {String} - Texto formateado
 */
function formatMetodoPago(metodo) {
  switch(metodo) {
    case 'efectivo': return 'Efectivo';
    case 'tarjeta': return 'Tarjeta de Crédito/Débito';
    case 'transferencia': return 'Transferencia Electrónica';
    default: return metodo;
  }
}
