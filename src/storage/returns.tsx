import { Q } from "@nozbe/watermelondb";
import { database } from "./database";

// ===== OPERACIONES DE LECTURA =====

// Obtener todas las devoluciones
export const getAllDevolucionesDB = async () => {
  try {
    const data = await database.get("devoluciones").query().fetch();
    return data;
  } catch (error) {
    console.error("Error al obtener devoluciones:", error);
    return [];
  }
};

// Obtener una devolución por ID
export const getDevolucionByIdDB = async (devolucionId) => {
  try {
    if (!devolucionId) throw new Error("ID de devolución no proporcionado");
    const data = await database.get("devoluciones").find(devolucionId);
    return data;
  } catch (error) {
    console.error(`Error al obtener devolución ${devolucionId}:`, error);
    return null;
  }
};

// Obtener una devolución por número
export const getDevolucionByNumeroDB = async (numero) => {
  try {
    if (!numero) throw new Error("Número de devolución no proporcionado");
    
    const data = await database
      .get("devoluciones")
      .query(Q.where("numero", numero))
      .fetch();
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error al obtener devolución número ${numero}:`, error);
    return null;
  }
};

// Obtener devoluciones por ID de pedido
export const getDevolucionesByPedidoIdDB = async (pedidoId) => {
  try {
    if (!pedidoId) throw new Error("ID de pedido no proporcionado");
    
    const data = await database
      .get("devoluciones")
      .query(Q.where("pedido_id", pedidoId))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener devoluciones del pedido ${pedidoId}:`, error);
    return [];
  }
};

// Obtener devoluciones por estado
export const getDevolucionesByEstadoDB = async (estado) => {
  try {
    if (!estado) throw new Error("Estado no proporcionado");
    
    const data = await database
      .get("devoluciones")
      .query(Q.where("estado", estado))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener devoluciones con estado ${estado}:`, error);
    return [];
  }
};

// Obtener devoluciones por código de cliente
export const getDevolucionesByClienteDB = async (codigoCliente) => {
  try {
    if (!codigoCliente) throw new Error("Código de cliente no proporcionado");
    
    const data = await database
      .get("devoluciones")
      .query(Q.where("codigo_cliente", codigoCliente))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener devoluciones del cliente ${codigoCliente}:`, error);
    return [];
  }
};

// ===== OPERACIONES DE ESCRITURA =====

// Crear una nueva devolución
export const createDevolucionDB = async (devolucionData) => {
  try {
    // Validar datos mínimos necesarios
    if (!devolucionData.numeroPedido) 
      throw new Error("Número de pedido es obligatorio");
    if (!devolucionData.pedidoId) 
      throw new Error("ID de pedido es obligatorio");
    
    // Obtener el pedido relacionado
    const pedido = await database.get("pedidos").find(devolucionData.pedidoId);
    
    let newDevolucion;
    await database.write(async () => {
      newDevolucion = await database.get("devoluciones").create(devolucion => {
        // Establecer relación con pedido
        devolucion.pedido.set(pedido);
        
        // Campos obligatorios
        devolucion.numeroPedido = devolucionData.numeroPedido;
        devolucion.numero = devolucionData.numero || 0;
        
        // Datos que pueden heredarse del pedido
        devolucion.hojaRuta = devolucionData.hojaRuta || pedido.hojaRuta || '';
        devolucion.codigoCliente = devolucionData.codigoCliente || pedido.codigoCliente || '';
        devolucion.nombreCliente = devolucionData.nombreCliente || pedido.nombreCliente || '';
        devolucion.direccion = devolucionData.direccion || pedido.direccion || '';
        devolucion.horario = devolucionData.horario || pedido.horario || '';
        
        // Campos con valores predeterminados
        devolucion.bultos = devolucionData.bultos || 1;
        devolucion.estado = devolucionData.estado || 'pendiente';
        devolucion.observaciones = devolucionData.observaciones || '';
        devolucion.secuencia = devolucionData.secuencia || 1;
        
        // Coordenadas opcionales
        if (devolucionData.latitud !== undefined) devolucion.latitud = devolucionData.latitud;
        if (devolucionData.longitud !== undefined) devolucion.longitud = devolucionData.longitud;
      });
    });
    
    return newDevolucion;
  } catch (error) {
    console.error("Error al crear devolución:", error);
    return null;
  }
};

// Actualizar una devolución
export const updateDevolucionDB = async (devolucionId, updateData) => {
  try {
    if (!devolucionId) throw new Error("ID de devolución no proporcionado");
    
    const devolucionToUpdate = await database.get("devoluciones").find(devolucionId);
    
    let updatedDevolucion;
    await database.write(async () => {
      updatedDevolucion = await devolucionToUpdate.update(devolucion => {
        // Solo actualizar campos que vienen en updateData
        if (updateData.numero !== undefined) devolucion.numero = updateData.numero;
        if (updateData.numeroPedido !== undefined) devolucion.numeroPedido = updateData.numeroPedido;
        if (updateData.hojaRuta !== undefined) devolucion.hojaRuta = updateData.hojaRuta;
        if (updateData.bultos !== undefined) devolucion.bultos = updateData.bultos;
        if (updateData.codigoCliente !== undefined) devolucion.codigoCliente = updateData.codigoCliente;
        if (updateData.nombreCliente !== undefined) devolucion.nombreCliente = updateData.nombreCliente;
        if (updateData.direccion !== undefined) devolucion.direccion = updateData.direccion;
        if (updateData.horario !== undefined) devolucion.horario = updateData.horario;
        if (updateData.estado !== undefined) devolucion.estado = updateData.estado;
        if (updateData.observaciones !== undefined) devolucion.observaciones = updateData.observaciones;
        if (updateData.secuencia !== undefined) devolucion.secuencia = updateData.secuencia;
        if (updateData.latitud !== undefined) devolucion.latitud = updateData.latitud;
        if (updateData.longitud !== undefined) devolucion.longitud = updateData.longitud;
      });
    });
    
    return updatedDevolucion;
  } catch (error) {
    console.error(`Error al actualizar devolución ${devolucionId}:`, error);
    return null;
  }
};

