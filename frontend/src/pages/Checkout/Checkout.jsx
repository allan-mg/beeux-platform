import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getOrderById, createCheckoutSession } from "../../api/ordersApi";
import "./Checkout.css";

function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      navigate("/login");
      return;
    }

    getOrderById({
      token,
      orderId,
    })
      .then((data) => {
        setOrder(data);
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId, navigate]);

  if (isLoading) {
    return <main className="checkout">Cargando orden...</main>;
  }

  if (errorMessage) {
    return <main className="checkout">{errorMessage}</main>;
  }

  const handlePayment = () => {
    const token = localStorage.getItem("jwt");

    if (!token || !order) {
      return;
    }

    setIsRedirecting(true);
    setPaymentError("");

    createCheckoutSession({
      token,
      orderId: order._id,
    })
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((error) => {
        setPaymentError(error);
        setIsRedirecting(false);
      });
  };

  return (
    <>
      <Header />

      <main className="checkout">
        <div className="checkout__container">
          <span className="checkout__eyebrow">Resumen de contratación</span>

          <h1 className="checkout__title">Revisa tu servicio</h1>

          <div className="checkout__card">
            <div className="checkout__row">
              <span>Servicio</span>
              <strong>{order.serviceName}</strong>
            </div>

            <div className="checkout__row">
              <span>Tipo de contratación</span>
              <strong>{order.billingType}</strong>
            </div>

            <div className="checkout__row">
              <span>Estado</span>
              <strong>{order.status}</strong>
            </div>

            <div className="checkout__total">
              <span>Total</span>

              <strong>
                ${order.amount} {order.currency}
              </strong>
            </div>

            <p className="checkout__notice">
              La inversión publicitaria en plataformas como Meta Ads, Facebook,
              Instagram, TikTok, Google Ads u otros medios no está incluida en
              este importe y es cubierta directamente por el cliente.
            </p>

            <button
              className="checkout__button"
              type="button"
              onClick={handlePayment}
              disabled={isRedirecting}
            >
              {isRedirecting ? "Redirigiendo a Stripe..." : "Continuar al pago"}
            </button>
            {paymentError && <p className="checkout__error">{paymentError}</p>}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
