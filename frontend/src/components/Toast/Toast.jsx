import "./Toast.css";

function Toast({ message, type = "success", onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`toast toast--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="toast__icon">{type === "error" ? "!" : "✓"}</div>

      <p className="toast__message">{message}</p>

      <button
        type="button"
        className="toast__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
