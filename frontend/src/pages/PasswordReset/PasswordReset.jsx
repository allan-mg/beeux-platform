import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import {
  completePasswordReset,
  getPasswordReset,
} from "../../api/authApi";

import "./PasswordReset.css";

function PasswordReset() {
  const { token } = useParams();

  const [resetData, setResetData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    getPasswordReset(token)
      .then((data) => {
        setResetData(data);
      })
      .catch((error) => {
        setErrorMessage(
          error.message ||
            error ||
            "El enlace de restablecimiento no es válido o expiró.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    completePasswordReset({ token, password })
      .then(() => {
        setIsCompleted(true);
      })
      .catch((error) => {
        setErrorMessage(
          error.message || error || "No se pudo actualizar la contraseña.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Header />

      <main className="password-reset">
        <div className="password-reset__container">
          {isLoading ? (
            <div className="password-reset__card">Validando enlace...</div>
          ) : isCompleted ? (
            <div className="password-reset__card">
              <span className="password-reset__eyebrow">Acceso BeeUX</span>
              <h1>Tu contraseña fue actualizada</h1>
              <p>
                Ya puedes iniciar sesión con tu correo y la nueva contraseña.
                Las sesiones anteriores quedaron invalidadas.
              </p>
              <Link className="password-reset__primary-link" to="/login">
                Iniciar sesión
              </Link>
            </div>
          ) : !resetData ? (
            <div className="password-reset__card">
              <span className="password-reset__eyebrow">Restablecimiento</span>
              <h1>No pudimos validar este enlace</h1>
              <p>
                {errorMessage ||
                  "El enlace de restablecimiento no es válido o expiró."}
              </p>
            </div>
          ) : (
            <div className="password-reset__card">
              <span className="password-reset__eyebrow">Seguridad BeeUX</span>
              <h1>Crea una nueva contraseña</h1>
              <p>
                Hola, <strong>{resetData.name}</strong>. Estás cambiando la
                contraseña de la cuenta <strong>{resetData.email}</strong>.
              </p>

              {resetData.isActive === false && (
                <p className="password-reset__notice">
                  Esta cuenta está desactivada. Podrás cambiar la contraseña,
                  pero un administrador deberá reactivarla antes de iniciar
                  sesión.
                </p>
              )}

              <form className="password-reset__form" onSubmit={handleSubmit}>
                <label>
                  <span>Nueva contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength="8"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label>
                  <span>Confirmar contraseña</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength="8"
                    autoComplete="new-password"
                    required
                  />
                </label>

                {errorMessage && (
                  <p className="password-reset__error">{errorMessage}</p>
                )}

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Actualizando contraseña..."
                    : "Guardar nueva contraseña"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PasswordReset;
