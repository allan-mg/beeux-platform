import { API_BASE_URL } from "../config/api";

export const getTeamMembers = (token) =>
  fetch(`${API_BASE_URL}/admin/team`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });
