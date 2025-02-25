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

export const getCommunications = async (payload) => {
  try {
    const response = await api.get(`/mensajes?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getCommunicationById = async (payload) => {
  try {
    const response = await api.get(`/mensajes/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const deleteConfirmCommunication = async (payload) => {
  try {
    const response = await api.delete(`/mensajes/state/${payload}`);

    return true;
  } catch (e) {
    throw e;
  }
};

export const postUserMessage = async (payload) => {
  try {
    await api.post(`/mensajes`, payload);

    return true;
  } catch (e) {
    throw e;
  }
};

export const putMessageById = async (payload) => {
  try {
    await api.put(`/mensajes/${payload?.Id}`, payload);

    return true;
  } catch (e) {
    throw e;
  }
};
///api/mensajes
