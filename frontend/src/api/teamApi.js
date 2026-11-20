import { API_BASE_URL } from "../config/api";

export const getTeamMembers = (token, { includeInactive = false } = {}) => {
  const query = includeInactive ? "?includeInactive=true" : "";

  return fetch(`${API_BASE_URL}/admin/team${query}`, {
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
};

export const updateTeamMemberStatus = ({ token, userId, isActive }) =>
  fetch(`${API_BASE_URL}/admin/team/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const createTeamInvite = ({ token, name, email }) =>
  fetch(`${API_BASE_URL}/admin/team/invitations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const getTeamInvite = (inviteToken) =>
  fetch(`${API_BASE_URL}/team/invitations/${inviteToken}`).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const acceptTeamInvite = ({ token, password }) =>
  fetch(`${API_BASE_URL}/team/invitations/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const createTeamMemberPasswordReset = ({ token, userId }) =>
  fetch(`${API_BASE_URL}/admin/team/${userId}/password-reset`, {
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
