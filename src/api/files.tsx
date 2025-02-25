import api from "./api";
import * as FileSystem from "expo-file-system";

export const postFile = async (params, containerName = "userdata") => {
  const formData = new FormData();
  formData.append("file", params);
  try {
    const response = await api.post(
      `blobfiles/upload?containerName=${containerName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Required for form data
        },
      },
    );
    return response.data;
  } catch (e) {
    throw e;
  }
};

export const fetchImage = async (fileName, containerName = "userdata") => {
  try {
    // Fetch the image as a Blob
    const response = await api.get(
      `blobfiles/download/${fileName}?containerName=${containerName}`,
      {
        responseType: "arraybuffer", // Fetch binary data as ArrayBuffer
      },
    );

    // Convert ArrayBuffer to base64
    const base64Data = arrayBufferToBase64(response.data);

    // Create a local file path to store the image
    const uri = FileSystem.documentDirectory + fileName;

    // Write the base64 data to a local file
    await FileSystem.writeAsStringAsync(uri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Return the local URI for the image
    return { uri };
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

// Helper function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary); // Convert binary to base64 string
};