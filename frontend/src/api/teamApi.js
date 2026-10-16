const BASE_URL = "http://localhost:3000";

export const getTeamMembers = (token) =>
  fetch(`${BASE_URL}/admin/team`, {
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
