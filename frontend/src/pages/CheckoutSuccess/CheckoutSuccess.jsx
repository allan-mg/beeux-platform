import { Link, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./CheckoutSuccess.css";

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <>
      <Header />

      <main className="checkout-success">
        <div className="checkout-success__container">
          <span className="checkout-success__icon">✓</span>

          <span className="checkout-success__eyebrow">Pago recibido</span>

          <h1 className="checkout-success__title">
            ¡Gracias por confiar en BeeUX!
          </h1>

          <p className="checkout-success__description">
            Tu pago fue procesado correctamente. Ahora continuaremos con los
            siguientes pasos para comenzar tu servicio.
          </p>

          {orderId && (
            <p className="checkout-success__order">Orden: {orderId}</p>
          )}

          <Link className="checkout-success__button" to="/dashboard">
            Ir a mi panel
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CheckoutSuccess;
