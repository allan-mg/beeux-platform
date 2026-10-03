const BASE_URL = "http://localhost:3000";

export const getServices = () =>
  fetch(`${BASE_URL}/services`).then((res) => {
    if (!res.ok) {
      return Promise.reject(`Error: ${res.status}`);
    }

    return res.json();
  });
