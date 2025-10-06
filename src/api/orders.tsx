import api from "./api";

const encodeParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    ) // Filtrar valores nulos o vacíos
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
};

export const getOrdersList = async (payload) => {
  try {
    const response = await api.get(`/pedidos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get(`/pedidos/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getOrderById = async (payload) => {
  try {
    const response = await api.get(`/pedidos/${payload}`);
    return {
      ...response.data,
    };
  } catch (e) {
    throw e;
  }
};

export const putOrderById = async (payload) => {
  try {
    await api.put(`/pedidos/${payload.Id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postOrder = async (payload) => {
  try {
    await api.post(`/pedidos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getDistrictOrder = async (id: string) => {
  try {
    const response = await api.get(`/pedidos/${id}/distrito`);
    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getOrdersByDate = async (date: string) => {
  try {
    const response = await api.get(`/entregas/asignadas?fechaEntrega=${date}`);
    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getCurrentRoadmap = async () => {
  try {
    const response = await api.get(
      `/entregas/current`,
    );
    return response?.data;
  } catch (e) {
    return null
  }
};


export const confirmOrderAssignment = async (payload: any) => {
  try {
    await api.put(
      `/entregas/confirmar_asignacion?hojaRutaId=${payload.Id}`,
      payload?.orders
    );
    return true;
  } catch (e) {
    throw e;
  }
};

export const invalidateOrderAssignment = async (payload: any) => {
  try {
    await api.put(
      `/entregas/anular_asignacion?hojaRutaId=${payload.Id}&motivo=${payload.motivo}`,
      payload.orders
    );
    return true;
  } catch (e) {
    throw e;
  }
};

export const rejectOrderAssignment = async (payload: any) => {
  try {
    await api.put(
      `/entregas/rechazar_asignacion?hojaRutaId=${payload.Id}&motivo=${payload.motivo}`,
      payload.orders
    );
    return true;
  } catch (e) {
    throw e;
  }
};

export const startRoadmap = async (payload: any) => {
  try {
    await api.put(
      `/entregas/iniciar_hojaruta/${payload.Id}`,
      payload.orders
    );
    return true;
  } catch (e) {
    throw e;
  }
};


export const putMoveOrdersInSameRoadmap = async (payload) => {
  try {
    await api.put(
      `/pedidos/asignar-secuencia?hojaRutaId=${payload.hojaRutaId}&pedidoId=${payload.pedidoId}&secuencia=${payload.secuencia}`
    );
    return true;
  } catch (e) {
    throw e;
  }
};

export const finishRoadmap = async (payload) => {
    try {
    await api.post(
      `/entregas/finalizar_hojaruta`,
      payload
    );
    return true;
  } catch (e) {
    throw e;
  }

}

///api/entregas/confirmar_asignacion
