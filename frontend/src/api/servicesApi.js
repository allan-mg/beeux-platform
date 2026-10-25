import { API_BASE_URL } from "../config/api";

export const getServices = () =>
  fetch(`${API_BASE_URL}/services`).then((res) => {
    if (!res.ok) {
      return Promise.reject(`Error: ${res.status}`);
    }

    return res.json();
  });
