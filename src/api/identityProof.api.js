import api from '../config/axios';

export const getIdentityProof = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/identity-proof/`);
    return response.data;
  } catch (err) {
    // If it's a 404, it means no document exists yet, so return null instead of throwing
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
};

export const uploadIdentityProof = async (employeeId, formData, onProgress) => {
  const response = await api.post(`/employees/${employeeId}/identity-proof/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const getIdentityProofFile = async (employeeId) => {
  // Assuming the backend has an endpoint to download/view the actual file
  // or that the GET response contains the file URL. If it's a dedicated endpoint:
  const response = await api.get(`/employees/${employeeId}/identity-proof/file/`);
  return response.data;
};
