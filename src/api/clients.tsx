import api from "./api";
import { decodeMenuItems } from "./dashboard";

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

export const getClientsList = async (payload) => {
  try {
    const response = await api.get(`/clientes?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getClientsByRouteId = async (payload) => {
  try {
    const response = await api.get(`/clientes/ruta?rutaId=${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};


export const getClientsDirection = async () => {
  try {
    const response = await api.get(`/clientes/direccion`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllClients = async () => {
  try {
    const response = await api.get(`/clientes`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableClient = async (id) => {
  try {
    await api.delete(`/clientes/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getClientById = async (payload) => {
  try {
    const response = await api.get(`/clientes/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putClientById = async (payload) => {
  try {
    await api.put(`/clientes/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postClient = async (payload) => {
  try {
    await api.post(`/clientes`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
