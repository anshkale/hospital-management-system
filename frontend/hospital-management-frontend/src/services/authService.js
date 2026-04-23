import axiosInstance from '../api/axiosConfig'; // ← must use axiosInstance

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/api/login', credentials);
    return response.data; // { success, token, role, patientId, email, firstName, lastName }
  } catch (error) {
    // Re-throw so LoginPage catch block can show the error message
    throw error;
  }
};