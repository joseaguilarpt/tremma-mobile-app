import api from "./api";

export const getSettings = async (type: string) => {
  try {
    const response = await api.get(`/settings?tipo=${type}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const postSettings = async (data: any) => {
  try {
    const response = await api.post(`/settings`, data);

    return response.data;
  } catch (e) {
    throw e;
  }
};
export const putSettings = async (data: any) => {
  try {
    const response = await api.put(`/settings/list`, data);

    return response.data;
  } catch (e) {
    throw e;
  }
};
