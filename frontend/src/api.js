// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
});

export const sendMessage = async (userId, message) => {
  const response = await API.post("/chat", { user_id: userId, message });
  return response.data;
};

export const getHistory = async (userId) => {
  const response = await API.get(`/history/${userId}`);
  return response.data;
};
