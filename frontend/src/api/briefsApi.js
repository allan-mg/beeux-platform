import { API_BASE_URL } from "../config/api";

export const getBriefByOrder = ({ token, orderId }) =>
  fetch(`${API_BASE_URL}/briefs/order/${orderId}`, {
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

export const updateBriefByOrder = ({
  token,
  orderId,
  answers,
  completed = false,
}) =>
  fetch(`${API_BASE_URL}/briefs/order/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      answers,
      completed,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });
