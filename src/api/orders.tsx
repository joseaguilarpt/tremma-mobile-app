import api from "./api";

const encodeParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== "",
    ) // Filtrar valores nulos o vacíos
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
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

export const deleteOrderById = async (id: string) => {
  try {
    await api.delete(`/pedidos/state/${id}`);
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
