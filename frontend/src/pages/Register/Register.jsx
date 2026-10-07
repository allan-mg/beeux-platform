import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Register.css";
import { register } from "../../api/authApi";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    register(formData)
      .then(() => {
        setSuccessMessage("Cuenta creada correctamente.");

        setFormData({
          name: "",
          email: "",
          password: "",
        });
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Header />

      <main className="register">
        <div className="register__container">
          <span className="register__eyebrow">Cuenta BeeUX</span>

          <h1 className="register__title">Crea tu cuenta</h1>

          <p className="register__description">
            Regístrate para contratar servicios y administrar tus proyectos
            desde tu panel BeeUX.
          </p>

          <form className="register__form" onSubmit={handleSubmit}>
            <label className="register__field">
              <span>Nombre</span>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register__field">
              <span>Correo electrónico</span>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="register__field">
              <span>Contraseña</span>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
            </label>

            {errorMessage && (
              <p className="register__message register__message_type_error">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="register__message register__message_type_success">
                {successMessage}
              </p>
            )}

            <button
              className="register__button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Register;
