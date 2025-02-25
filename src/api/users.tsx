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

export const getUsersList = async (payload) => {
  try {
    const response = await api.get(`/users?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get(`/users`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getNotDriverUsers = async () => {
  try {
    const response = await api.get(
      `/users/list?esConductor=false&esTercerizado=false`,
    );

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableUser = async (id) => {
  try {
    await api.delete(`/users/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getUserById = async (payload) => {
  try {
    const response = await api.get(`/users/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getRoleMenuById = async (payload) => {
  try {
    const response = await api.get(`/rolesoptions/${payload}/menu`);

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const getRoleMenuItemsById = async (id, param) => {
  try {
    const response = await api.get(`/rolesoptions/${id}/menu?modulo=${param}`);

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const getRoleOptionsById = async (id, param, subId) => {
  try {
    const response = await api.get(
      `/rolesoptions/${id}/options?modulo=${param}&optionId=${subId}`,
    );

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const putUserById = async (payload) => {
  try {
    await api.put(`/users/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postUser = async (payload) => {
  try {
    await api.post(`/users`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
