import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import {
  createTeamInvite,
  createTeamMemberPasswordReset,
  getTeamMembers,
  updateTeamMemberStatus,
} from "../../api/teamApi";

import "./AdminTeam.css";

function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [inviteLink, setInviteLink] = useState("");
  const [passwordResetLink, setPasswordResetLink] = useState("");
  const [passwordResetName, setPasswordResetName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberActionId, setMemberActionId] = useState("");
  const [passwordResetActionId, setPasswordResetActionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadTeamMembers = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setIsLoading(false);
      return;
    }

    return getTeamMembers(token, { includeInactive: true })
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

  const handleCopyLink = (link, successText) => {
    if (!link) {
      return;
    }

    navigator.clipboard
      .writeText(link)
      .then(() => {
        setSuccessMessage(successText);
      })
      .catch(() => {
        setErrorMessage("No se pudo copiar el enlace automáticamente.");
      });
  };

  const handlePasswordReset = (member) => {
    const token = localStorage.getItem("jwt");

    if (!token || member.role !== "employee") {
      return;
    }

    const confirmed = window.confirm(
      `¿Generar un enlace para restablecer la contraseña de ${member.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setPasswordResetActionId(member._id);
    setErrorMessage("");
    setSuccessMessage("");
    setPasswordResetLink("");
    setPasswordResetName("");

    createTeamMemberPasswordReset({
      token,
      userId: member._id,
    })
      .then((reset) => {
        const link = `${window.location.origin}/password-reset/${reset.token}`;

        setPasswordResetLink(link);
        setPasswordResetName(member.name);
        setSuccessMessage(
          `Enlace de restablecimiento creado para ${member.name}. Vence en 1 hora.`,
        );
      })
      .catch((error) => {
        setErrorMessage(
          error.message ||
            error ||
            "No se pudo generar el enlace de restablecimiento.",
        );
      })
      .finally(() => {
        setPasswordResetActionId("");
      });
  };

  const handleMemberStatusChange = (member) => {
    const token = localStorage.getItem("jwt");

    if (!token || member.role !== "employee") {
      return;
    }

    const nextIsActive = member.isActive === false;
    const actionLabel = nextIsActive ? "reactivar" : "desactivar";

    const confirmed = window.confirm(
      `¿Seguro que quieres ${actionLabel} a ${member.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setMemberActionId(member._id);
    setErrorMessage("");
    setSuccessMessage("");

    updateTeamMemberStatus({
      token,
      userId: member._id,
      isActive: nextIsActive,
    })
      .then((updatedMember) => {
        setTeamMembers((current) =>
          current.map((item) =>
            item._id === updatedMember._id ? { ...item, ...updatedMember } : item,
          ),
        );

        setSuccessMessage(
          nextIsActive
            ? `${member.name} fue reactivado correctamente.`
            : `${member.name} fue desactivado correctamente.`,
        );
      })
      .catch((error) => {
        setErrorMessage(
          error.message || error || "No se pudo actualizar el acceso del empleado.",
        );
      })
      .finally(() => {
        setMemberActionId("");
      });
  };

  const employees = teamMembers.filter((member) => member.role === "employee");
  const activeEmployees = employees.filter((member) => member.isActive !== false);
  const inactiveEmployees = employees.filter((member) => member.isActive === false);
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
              <span>Empleados activos</span>
              <strong>{activeEmployees.length}</strong>
            </article>
            <article>
              <span>Empleados inactivos</span>
              <strong>{inactiveEmployees.length}</strong>
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

                <button
                  type="button"
                  onClick={() =>
                    handleCopyLink(inviteLink, "Enlace de invitación copiado.")
                  }
                >
                  Copiar enlace
                </button>
              </div>
            )}
          </section>

          {passwordResetLink && (
            <section className="admin-team__password-reset-section">
              <div className="admin-team__section-heading">
                <div>
                  <span>Seguridad</span>
                  <h2>Restablecimiento de contraseña</h2>
                </div>
              </div>

              <p className="admin-team__password-reset-description">
                Comparte este enlace únicamente con {passwordResetName}. El
                enlace vence en 1 hora y solo puede utilizarse una vez.
              </p>

              <div className="admin-team__invite-result">
                <div>
                  <span>Enlace de restablecimiento</span>
                  <code>{passwordResetLink}</code>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyLink(
                      passwordResetLink,
                      "Enlace de restablecimiento copiado.",
                    )
                  }
                >
                  Copiar enlace
                </button>
              </div>
            </section>
          )}

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

                    <div className="admin-team__member-actions">
                      <span
                        className={`admin-team__role admin-team__role--${member.role}`}
                      >
                        {member.role === "admin"
                          ? "Admin"
                          : member.isActive === false
                            ? "Empleado inactivo"
                            : "Empleado"}
                      </span>

                      {member.role === "employee" && (
                        <button
                          className="admin-team__reset-button"
                          type="button"
                          disabled={passwordResetActionId === member._id}
                          onClick={() => handlePasswordReset(member)}
                        >
                          {passwordResetActionId === member._id
                            ? "Generando..."
                            : "Restablecer contraseña"}
                        </button>
                      )}

                      {member.role === "employee" && (
                        <button
                          className={`admin-team__status-button ${
                            member.isActive === false
                              ? "admin-team__status-button--activate"
                              : "admin-team__status-button--deactivate"
                          }`}
                          type="button"
                          disabled={memberActionId === member._id}
                          onClick={() => handleMemberStatusChange(member)}
                        >
                          {memberActionId === member._id
                            ? "Actualizando..."
                            : member.isActive === false
                              ? "Reactivar"
                              : "Desactivar"}
                        </button>
                      )}
                    </div>
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
