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

export const getProvinceList = async (payload) => {
  try {
    const response = await api.get(`/provincias?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllProvinces = async () => {
  try {
    const response = await api.get(`/provincias/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getProvinceById = async (payload) => {
  try {
    const response = await api.get(`/provincias/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putProvinceById = async (payload) => {
  try {
    await api.put(`/provincias/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postProvince = async (payload) => {
  try {
    await api.post(`/provincias`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deleteProvinceById = async (id: string) => {
  try {
    await api.delete(`/provincias/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};
