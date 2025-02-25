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

export const getDistrictList = async (payload) => {
  try {
    const response = await api.get(`/distritos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllDistricts = async (payload) => {
  try {
    const response = await api.get(`/distritos/list?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getDistrictById = async (payload) => {
  try {
    const response = await api.get(`/distritos/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putDistrictById = async (payload) => {
  try {
    await api.put(`/distritos/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postDistrict = async (payload) => {
  try {
    await api.post(`/distritos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deleteDistrictById = async (id: string) => {
  try {
    await api.delete(`/distritos/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};
