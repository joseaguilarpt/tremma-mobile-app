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

export const getIdentificationList = async () => {
  try {
    const response = await api.get(`/tipoIdentificaciones/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getIdentificationsList = async (payload) => {
  try {
    const response = await api.get(
      `/tipoIdentificaciones?${encodeParams(payload)}`,
    );

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllIdentificactions = async () => {
  try {
    const response = await api.get(`/tipoIdentificaciones`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableIdentificaction = async (id) => {
  try {
    await api.delete(`/tipoIdentificaciones/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getIdentificactionById = async (payload) => {
  try {
    const response = await api.get(`/tipoIdentificaciones/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putIdentificactionById = async (payload) => {
  try {
    await api.put(`/tipoIdentificaciones/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postIdentificaction = async (payload) => {
  try {
    await api.post(`/tipoIdentificaciones`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
