import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Row, Col, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaPrint, FaCheck, FaTimes } from 'react-icons/fa';
import devolucionService from '../services/devolucion.service';
import { formatCurrency, formatDate } from '../utils/formatters';

const DevolucionDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devolucion, setDevolucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    loadDevolucionDetails();
  }, [id]);
  const loadDevolucionDetails = async () => {
    try {
      setLoading(true);
      const data = await devolucionService.getDevolucionPorId(id);
      setDevolucion(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar los detalles de la devolución:", err);
      setError("No se pudo cargar la información de la devolución. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = async () => {
    try {
      await devolucionService.generarComprobante(id);
    } catch (err) {
      console.error("Error al generar el comprobante:", err);
      setError("No se pudo generar el comprobante de devolución.");
    }
  };

  const handleAuthorize = async () => {
    try {
      setProcessingAction(true);
      await devolucionService.autorizarDevolucion(id);
      setActionSuccess("La devolución ha sido autorizada correctamente.");
      loadDevolucionDetails();
      setShowAuthorizeModal(false);
    } catch (err) {
      console.error("Error al autorizar la devolución:", err);
      setError("No se pudo autorizar la devolución. Verifique que haya stock disponible.");
    } finally {
      setProcessingAction(false);
    }
  };
  const handleCancel = async () => {
    try {
      setProcessingAction(true);
      await devolucionService.cancelarDevolucion(id);
      setActionSuccess("La devolución ha sido cancelada correctamente.");
      loadDevolucionDetails();
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error al cancelar la devolución:", err);
      setError("No se pudo cancelar la devolución.");
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'autorizado':
        return <Badge bg="success">Autorizado</Badge>;
      case 'completado':
        return <Badge bg="info">Completado</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const getDevolucionTypeBadge = (tipo) => {
    switch (tipo) {
      case 'devolucion':
        return <Badge bg="primary">Devolución</Badge>;
      case 'cambio':
        return <Badge bg="info">Cambio</Badge>;
      default:
        return <Badge bg="secondary">{tipo}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2">Cargando detalles de la devolución...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => navigate('/devoluciones')}>
          <FaArrowLeft className="me-2" />Volver a la lista
        </Button>
      </Alert>
    );
  }

  if (!devolucion) {
    return (
      <Alert variant="warning" className="my-3">
        <Alert.Heading>Devolución no encontrada</Alert.Heading>
        <p>La devolución solicitada no existe o ha sido eliminada.</p>
        <Button variant="outline-primary" onClick={() => navigate('/devoluciones')}>
          <FaArrowLeft className="me-2" />Volver a la lista
        </Button>
      </Alert>
    );
  }

  return (
    <div className="devolucion-detalle mb-4">
      {actionSuccess && (
        <Alert variant="success" onClose={() => setActionSuccess(null)} dismissible>
          {actionSuccess}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <h4 className="mb-0">
            Detalles de la Devolución #{devolucion.id}
            <span className="ms-3">{getDevolucionTypeBadge(devolucion.tipo)}</span>
            <span className="ms-2">{getStatusBadge(devolucion.estado)}</span>
          </h4>
          <Button variant="outline-secondary" onClick={() => navigate('/devoluciones')}>
            <FaArrowLeft className="me-1" /> Volver
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h5>Información General</h5>
              <p><strong>Fecha:</strong> {formatDate(devolucion.createdAt)}</p>
              <p><strong>Cliente:</strong> {devolucion.Cliente ? `${devolucion.Cliente.nombre} ${devolucion.Cliente.apellidos}` : 'Cliente no registrado'}</p>
              <p><strong>Venta Original:</strong> #{devolucion.venta_id}</p>
              <p><strong>Motivo:</strong> {devolucion.motivo}</p>
              {devolucion.autorizado_por && (
                <p><strong>Autorizado por:</strong> {devolucion.Usuario ? devolucion.Usuario.nombre : devolucion.autorizado_por}</p>
              )}
            </Col>
            <Col md={6}>
              <h5>Resumen</h5>
              <p><strong>Total devolución:</strong> {formatCurrency(devolucion.total)}</p>
              <p><strong>Estado:</strong> {getStatusBadge(devolucion.estado)}</p>
              <p><strong>Tipo:</strong> {devolucion.tipo === 'devolucion' ? 'Devolución' : 'Cambio'}</p>
              {devolucion.fecha_autorizacion && (
                <p><strong>Fecha autorización:</strong> {formatDate(devolucion.fecha_autorizacion)}</p>
              )}
            </Col>
          </Row>

          <h5 className="mb-3">Productos devueltos</h5>
          <Table responsive striped hover className="mb-4">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {devolucion.DetallesDevoluciones && devolucion.DetallesDevoluciones.map((detalle) => (
                <tr key={detalle.id}>
                  <td>{detalle.Producto?.codigo || 'N/A'}</td>
                  <td>{detalle.Producto?.nombre || 'Producto no disponible'}</td>
                  <td>{detalle.cantidad}</td>
                  <td>{formatCurrency(detalle.precio_unitario)}</td>
                  <td>{formatCurrency(detalle.subtotal)}</td>
                  <td>
                    {detalle.producto_defectuoso ? 
                      <Badge bg="danger">Defectuoso</Badge> : 
                      <Badge bg="success">Buen estado</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {devolucion.tipo === 'cambio' && devolucion.DetallesDevoluciones.some(d => d.producto_cambio_id) && (
            <>
              <h5 className="mb-3">Productos de cambio</h5>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {devolucion.DetallesDevoluciones
                    .filter(detalle => detalle.producto_cambio_id)
                    .map((detalle) => (
                      <tr key={`cambio-${detalle.id}`}>
                        <td>{detalle.ProductoCambio?.codigo || 'N/A'}</td>
                        <td>{detalle.ProductoCambio?.nombre || 'Producto no disponible'}</td>
                        <td>{detalle.cantidad_cambio}</td>
                        <td>{formatCurrency(detalle.precio_cambio)}</td>
                        <td>{formatCurrency(detalle.subtotal_cambio || (detalle.cantidad_cambio * detalle.precio_cambio))}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}

          <Row className="mt-4">
            <Col className="d-flex gap-2 justify-content-end">
              <Button 
                variant="primary" 
                onClick={handlePrintReceipt}
              >
                <FaPrint className="me-1" /> Imprimir Comprobante
              </Button>
              
              {devolucion.estado === 'pendiente' && (
                <>
                  <Button 
                    variant="success" 
                    onClick={() => setShowAuthorizeModal(true)}
                  >
                    <FaCheck className="me-1" /> Autorizar
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => setShowCancelModal(true)}
                  >
                    <FaTimes className="me-1" /> Cancelar
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal de confirmación para autorizar */}
      <Modal show={showAuthorizeModal} onHide={() => setShowAuthorizeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar autorización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea autorizar esta devolución? 
          Esta acción afectará al inventario y no podrá revertirse.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuthorizeModal(false)} disabled={processingAction}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleAuthorize} 
            disabled={processingAction}
          >
            {processingAction ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Procesando...</span>
              </>
            ) : (
              <>
                <FaCheck className="me-1" /> Autorizar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para cancelar */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea cancelar esta devolución? Esta acción no podrá revertirse.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={processingAction}>
            Volver
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancel} 
            disabled={processingAction}
          >
            {processingAction ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Procesando...</span>
              </>
            ) : (
              <>
                <FaTimes className="me-1" /> Cancelar Devolución
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DevolucionDetalle;
