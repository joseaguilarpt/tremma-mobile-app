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

export const getImportOrdersList = async (payload) => {
  try {
    const response = await api.get(`/importarpedidos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllImportOrders = async () => {
  try {
    const response = await api.get(`/importarpedidos/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getImportOrderById = async (payload) => {
  try {
    const response = await api.get(`/importarpedidos/${payload}`);
    return {
      ...response.data,
    };
  } catch (e) {
    throw e;
  }
};

export const putImportOrderById = async (payload) => {
  try {
    await api.put(`/importarpedidos/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postImportOrder = async (payload) => {
  try {
    await api.post(`/importarpedidos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const putImportOrderStatusById = async (id: string, estado: number) => {
  try {
    await api.put(`/importarpedidos/state/${id}?estado=${estado}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getNewClientsInOrders = async (id: string) => {
  try {
    const response = await api.get(`/importarpedidos/clientes-nuevos/${id}`);
    return response.data;
  } catch (e) {
    throw e;
  }
};
