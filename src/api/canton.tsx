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

export const getCantonesList = async (payload) => {
  try {
    const response = await api.get(`/cantones?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllCantones = async () => {
  try {
    const response = await api.get(`/cantones/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getCantonById = async (payload) => {
  try {
    const response = await api.get(`/cantones/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putCantonById = async (payload) => {
  try {
    await api.put(`/cantones/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postCanton = async (payload) => {
  try {
    await api.post(`/cantones`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deleteCantonById = async (id: string) => {
  try {
    await api.delete(`/cantones/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};
