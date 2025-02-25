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

export const getProductsList = async (payload) => {
  try {
    const response = await api.get(`/productos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllProducts = async () => {
  try {
    const response = await api.get(`/productos`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableProduct = async (id) => {
  try {
    await api.delete(`/productos/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getProductById = async (payload) => {
  try {
    const response = await api.get(`/productos/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putProductById = async (payload) => {
  try {
    await api.put(`/productos/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postProduct = async (payload) => {
  try {
    await api.post(`/productos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
