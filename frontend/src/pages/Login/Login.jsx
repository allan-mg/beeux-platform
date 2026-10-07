import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Login.css";
import { login, getCurrentUser } from "../../api/authApi";
import { useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { setCurrentUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();

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

    login(formData)
      .then((data) => {
        localStorage.setItem("jwt", data.token);

        return getCurrentUser(data.token);
      })
      .then((user) => {
        setCurrentUser(user);
        navigate("/dashboard");
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

      <main className="login">
        <div className="login__container">
          <span className="login__eyebrow">Cuenta BeeUX</span>

          <h1 className="login__title">Inicia sesión</h1>

          <p className="login__description">
            Accede a tus proyectos, archivos, pagos y próximos pasos desde tu
            panel BeeUX.
          </p>

          <form className="login__form" onSubmit={handleSubmit}>
            <label className="login__field">
              <span>Correo electrónico</span>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="login__field">
              <span>Contraseña</span>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            {errorMessage && (
              <p className="login__message login__message_type_error">
                {errorMessage}
              </p>
            )}

            <button
              className="login__button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Login;
