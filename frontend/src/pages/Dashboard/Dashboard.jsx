import { useContext } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser } = useContext(CurrentUserContext);

  return (
    <>
      <Header />

      <main className="dashboard">
        <div className="dashboard__container">
          <span className="dashboard__eyebrow">Panel BeeUX</span>

          <h1 className="dashboard__title">
            Hola, {currentUser?.name || "cliente"}
          </h1>

          <p className="dashboard__description">
            Aquí podrás consultar tus proyectos, pagos, archivos, contratos,
            reuniones y próximos pasos.
          </p>

          <div className="dashboard__grid">
            <article className="dashboard__card">
              <span>Proyectos activos</span>
              <strong>0</strong>
            </article>

            <article className="dashboard__card">
              <span>Contratos pendientes</span>
              <strong>0</strong>
            </article>

            <article className="dashboard__card">
              <span>Próximas reuniones</span>
              <strong>0</strong>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;
