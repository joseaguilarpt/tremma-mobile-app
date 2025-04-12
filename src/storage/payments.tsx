import { Q } from "@nozbe/watermelondb";
import { database } from "./database";

// ===== OPERACIONES DE LECTURA =====

// Obtener todos los pagos
export const getAllPaymentsDB = async () => {
  try {
    const data = await database.get("payments").query().fetch();
    return data;
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
};

// Obtener un pago por ID
export const getPaymentByIdDB = async (paymentId) => {
  try {
    if (!paymentId) throw new Error("ID de pago no proporcionado");
    const data = await database.get("payments").find(paymentId);
    return data;
  } catch (error) {
    console.error(`Error al obtener pago ${paymentId}:`, error);
    return null;
  }
};

// Obtener pagos para un pedido específico
export const getPaymentsByPedidoIdDB = async (pedidoId) => {
  try {
    if (!pedidoId) throw new Error("ID de pedido no proporcionado");
    
    const data = await database
      .get("payments")
      .query(Q.where("pedido_id", pedidoId))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener pagos del pedido ${pedidoId}:`, error);
    return [];
  }
};

// Obtener pagos por método de pago
export const getPaymentsByMetodoPagoDB = async (metodoPagoId) => {
  try {
    if (!metodoPagoId) throw new Error("ID de método de pago no proporcionado");
    
    const data = await database
      .get("payments")
      .query(Q.where("metodo_pago_id", metodoPagoId))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener pagos por método ${metodoPagoId}:`, error);
    return [];
  }
};

// Obtener pagos realizados por un usuario específico
export const getPaymentsByUsuarioDB = async (usuario) => {
  try {
    if (!usuario) throw new Error("Usuario no proporcionado");
    
    const data = await database
      .get("payments")
      .query(Q.where("usuario", usuario))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener pagos del usuario ${usuario}:`, error);
    return [];
  }
};

// ===== OPERACIONES DE ESCRITURA =====

// Crear un nuevo pago
export const createPaymentDB = async (paymentData) => {
  try {
    // Validar datos mínimos requeridos
    if (!paymentData.pedidoId) throw new Error("ID de pedido es obligatorio");
    if (!paymentData.metodoPago) throw new Error("Método de pago es obligatorio");
    if (paymentData.monto === undefined || paymentData.monto <= 0) 
      throw new Error("Monto debe ser mayor que cero");
    
    let newPayment;
    await database.write(async () => {
      newPayment = await database.get("payments").create(payment => {
        // Datos del método de pago
        payment.metodoPagoId = paymentData.metodoPago.id;
        payment.metodoPagoDescripcion = paymentData.metodoPago.descripcion;
        
        // Datos principales
        payment.pedidoId = paymentData.pedidoId;
        payment.monto = paymentData.monto;
        payment.usuario = paymentData.usuario || 'system';
        
        // Datos opcionales
        payment.observaciones = paymentData.observaciones || '';
        payment.imagen = paymentData.imagen || '';
        payment.comprobante = paymentData.comprobante || '';
      });
    });
    
    return newPayment;
  } catch (error) {
    console.error("Error al crear pago:", error);
    return null;
  }
};

// Actualizar un pago
export const updatePaymentDB = async (paymentId, updateData) => {
  try {
    if (!paymentId) throw new Error("ID de pago no proporcionado");
    
    const paymentToUpdate = await database.get("payments").find(paymentId);
    
    let updatedPayment;
    await database.write(async () => {
      updatedPayment = await paymentToUpdate.update(payment => {
        // Solo actualizar campos que vienen en updateData
        if (updateData.metodoPago) {
          payment.metodoPagoId = updateData.metodoPago.id;
          payment.metodoPagoDescripcion = updateData.metodoPago.descripcion;
        }
        
        if (updateData.pedidoId !== undefined) payment.pedidoId = updateData.pedidoId;
        if (updateData.monto !== undefined) payment.monto = updateData.monto;
        if (updateData.observaciones !== undefined) payment.observaciones = updateData.observaciones;
        if (updateData.imagen !== undefined) payment.imagen = updateData.imagen;
        if (updateData.usuario !== undefined) payment.usuario = updateData.usuario;
        if (updateData.comprobante !== undefined) payment.comprobante = updateData.comprobante;
      });
    });
    
    return updatedPayment;
  } catch (error) {
    console.error(`Error al actualizar pago ${paymentId}:`, error);
    return null;
  }
};

