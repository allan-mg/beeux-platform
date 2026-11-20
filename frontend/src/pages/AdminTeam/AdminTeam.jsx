import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { createTeamInvite, getTeamMembers } from "../../api/teamApi";

import "./AdminTeam.css";

function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadTeamMembers = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setIsLoading(false);
      return;
    }

    return getTeamMembers(token)
      .then((data) => {
        setTeamMembers(data);
      })
      .catch((error) => {
        setErrorMessage(error.message || error || "No se pudo cargar el equipo.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión administrativa activa.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setInviteLink("");

    createTeamInvite({
      token,
      name: formData.name,
      email: formData.email,
    })
      .then((invite) => {
        const link = `${window.location.origin}/team/invitations/${invite.token}`;

        setInviteLink(link);
        setSuccessMessage(
          `Invitación creada para ${invite.name}. El enlace vence en 7 días.`,
        );
        setFormData({ name: "", email: "" });
      })
      .catch((error) => {
        setErrorMessage(
          error.message || error || "No se pudo crear la invitación.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCopyInvite = () => {
    if (!inviteLink) {
      return;
    }

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setSuccessMessage("Enlace de invitación copiado.");
      })
      .catch(() => {
        setErrorMessage("No se pudo copiar el enlace automáticamente.");
      });
  };

  const employees = teamMembers.filter((member) => member.role === "employee");
  const admins = teamMembers.filter((member) => member.role === "admin");

  return (
    <>
      <Header />

      <main className="admin-team">
        <div className="admin-team__container">
          <span className="admin-team__eyebrow">Administración</span>
          <h1 className="admin-team__title">Equipo</h1>
          <p className="admin-team__description">
            Consulta a las personas con acceso interno e invita nuevos empleados
            de forma segura.
          </p>

          <section className="admin-team__summary">
            <article>
              <span>Administradores</span>
              <strong>{admins.length}</strong>
            </article>
            <article>
              <span>Empleados</span>
              <strong>{employees.length}</strong>
            </article>
            <article>
              <span>Total interno</span>
              <strong>{teamMembers.length}</strong>
            </article>
          </section>

          <section className="admin-team__invite-section">
            <div className="admin-team__section-heading">
              <div>
                <span>Nuevo acceso</span>
                <h2>Invitar empleado</h2>
              </div>
            </div>

            <form className="admin-team__invite-form" onSubmit={handleSubmit}>
              <label>
                <span>Nombre</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Ana López"
                  required
                />
              </label>

              <label>
                <span>Correo electrónico</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ana@beeux.mx"
                  required
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando invitación..." : "Crear invitación"}
              </button>
            </form>

            {errorMessage && (
              <p className="admin-team__message admin-team__message--error">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="admin-team__message admin-team__message--success">
                {successMessage}
              </p>
            )}

            {inviteLink && (
              <div className="admin-team__invite-result">
                <div>
                  <span>Enlace de invitación</span>
                  <code>{inviteLink}</code>
                </div>

                <button type="button" onClick={handleCopyInvite}>
                  Copiar enlace
                </button>
              </div>
            )}
          </section>

          <section className="admin-team__members-section">
            <div className="admin-team__section-heading">
              <div>
                <span>Accesos internos</span>
                <h2>Miembros del equipo</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="admin-team__empty">Cargando equipo...</div>
            ) : teamMembers.length === 0 ? (
              <div className="admin-team__empty">Todavía no hay miembros.</div>
            ) : (
              <div className="admin-team__members-list">
                {teamMembers.map((member) => (
                  <article className="admin-team__member" key={member._id}>
                    <div className="admin-team__member-avatar">
                      {member.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="admin-team__member-info">
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                    </div>

                    <span
                      className={`admin-team__role admin-team__role--${member.role}`}
                    >
                      {member.role === "admin" ? "Admin" : "Empleado"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default AdminTeam;
