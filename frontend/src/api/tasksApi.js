const BASE_URL = "http://localhost:3000";

export const getMyTasks = (token) =>
  fetch(`${BASE_URL}/team/tasks/me`, {
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

export const updateMyTaskStatus = ({ token, taskId, status }) =>
  fetch(`${BASE_URL}/team/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const getProjectTasks = ({ token, projectId }) =>
  fetch(`${BASE_URL}/admin/projects/${projectId}/tasks`, {
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

export const createProjectTask = ({ token, projectId, task }) =>
  fetch(`${BASE_URL}/admin/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const updateTask = ({ token, taskId, updates }) =>
  fetch(`${BASE_URL}/admin/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const getTaskActivity = ({ token, taskId }) =>
  fetch(`http://localhost:3000/admin/tasks/${taskId}/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }

    return res.json().then((data) => {
      throw new Error(
        data.message || "No se pudo obtener el historial de la tarea",
      );
    });
  });

export const addTaskComment = ({ token, taskId, message, mode = "admin" }) =>
  fetch(`http://localhost:3000/${mode}/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }

    return res.json().then((data) => {
      throw new Error(data.message || "No se pudo agregar el comentario");
    });
  });

export const getMyTaskActivity = ({ token, taskId }) =>
  fetch(`http://localhost:3000/team/tasks/${taskId}/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }

    return res.json().then((data) => {
      throw new Error(
        data.message || "No se pudo obtener el historial de la tarea",
      );
    });
  });

export const getTaskDeliverables = ({ token, taskId, mode = "team" }) =>
  fetch(`${BASE_URL}/${mode}/tasks/${taskId}/deliverables`, {
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

export const addMyTaskDeliverable = ({ token, taskId, deliverable }) =>
  fetch(`${BASE_URL}/team/tasks/${taskId}/deliverables`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deliverable),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });

export const toggleTaskArchive = ({ token, taskId, isArchived }) =>
  fetch(`${BASE_URL}/admin/tasks/${taskId}/archive`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      isArchived,
    }),
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      return Promise.reject(data.message || `Error: ${res.status}`);
    }

    return data;
  });
