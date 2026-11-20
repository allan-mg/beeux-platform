import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { acceptTeamInvite, getTeamInvite } from "../../api/teamApi";

import "./TeamInviteAccept.css";

function TeamInviteAccept() {
  const { token } = useParams();

  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    getTeamInvite(token)
      .then((data) => {
        setInvite(data);
      })
      .catch((error) => {
        setErrorMessage(
          error.message || error || "La invitación no es válida o expiró.",
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

    acceptTeamInvite({ token, password })
      .then(() => {
        setIsAccepted(true);
      })
      .catch((error) => {
        setErrorMessage(
          error.message || error || "No se pudo aceptar la invitación.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Header />

      <main className="team-invite">
        <div className="team-invite__container">
          {isLoading ? (
            <div className="team-invite__card">Validando invitación...</div>
          ) : isAccepted ? (
            <div className="team-invite__card">
              <span className="team-invite__eyebrow">Bienvenido a BeeUX</span>
              <h1>Tu cuenta de empleado está lista</h1>
              <p>
                Ya puedes iniciar sesión con el correo de tu invitación y la
                contraseña que acabas de crear.
              </p>
              <Link className="team-invite__primary-link" to="/login">
                Iniciar sesión
              </Link>
            </div>
          ) : !invite ? (
            <div className="team-invite__card">
              <span className="team-invite__eyebrow">Invitación</span>
              <h1>No pudimos validar este enlace</h1>
              <p>{errorMessage || "La invitación no es válida o expiró."}</p>
            </div>
          ) : (
            <div className="team-invite__card">
              <span className="team-invite__eyebrow">Equipo BeeUX</span>
              <h1>Activa tu cuenta</h1>
              <p>
                Hola, <strong>{invite.name}</strong>. Fuiste invitado como
                empleado de BeeUX con el correo <strong>{invite.email}</strong>.
              </p>

              <form className="team-invite__form" onSubmit={handleSubmit}>
                <label>
                  <span>Nueva contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength="8"
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
                    required
                  />
                </label>

                {errorMessage && (
                  <p className="team-invite__error">{errorMessage}</p>
                )}

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando cuenta..." : "Activar mi cuenta"}
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

export default TeamInviteAccept;
