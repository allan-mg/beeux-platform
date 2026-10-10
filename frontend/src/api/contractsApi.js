const BASE_URL = "http://localhost:3000";

export const getMyContracts = (token) =>
  fetch(`${BASE_URL}/contracts/me`, {
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

export const getContractByOrder = ({ token, orderId }) =>
  fetch(`${BASE_URL}/contracts/order/${orderId}`, {
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

export const generateContract = ({ token, orderId }) =>
  fetch(`${BASE_URL}/contracts/order/${orderId}/generate`, {
    method: "POST",
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

export const signContract = ({ token, orderId, accepted, signerName }) =>
  fetch(`${BASE_URL}/contracts/order/${orderId}/sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      accepted,
      signerName,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });
