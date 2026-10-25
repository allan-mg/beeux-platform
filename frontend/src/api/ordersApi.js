import { API_BASE_URL } from "../config/api";

export const createOrder = ({ token, serviceSlug, billingType }) =>
  fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      serviceSlug,
      billingType,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const getOrderById = ({ token, orderId }) =>
  fetch(`${API_BASE_URL}/orders/${orderId}`, {
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

export const createCheckoutSession = ({ token, orderId }) =>
  fetch(`${API_BASE_URL}/checkout/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });
