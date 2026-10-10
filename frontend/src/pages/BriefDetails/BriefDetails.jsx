import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getBriefByOrder, updateBriefByOrder } from "../../api/briefsApi";
import "./BriefDetails.css";

function BriefDetails() {
  const { orderId } = useParams();

  const [brief, setBrief] = useState(null);
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getBriefByOrder({
      token,
      orderId,
    })
      .then((data) => {
        setBrief(data.brief);
        setTemplate(data.template);
        setAnswers(data.brief.answers || {});
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  const handleChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));

    setSuccessMessage("");
  };

  const handleSaveDraft = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    updateBriefByOrder({
      token,
      orderId,
      answers,
      completed: false,
    })
      .then((data) => {
        setBrief(data.brief);
        setAnswers(data.brief.answers || {});

        setSuccessMessage("Tu avance fue guardado correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleCompleteBrief = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    updateBriefByOrder({
      token,
      orderId,
      answers,
      completed: true,
    })
      .then((data) => {
        setBrief(data.brief);
        setAnswers(data.brief.answers || {});

        setSuccessMessage(
          "Brief completado correctamente. Ya tenemos la información necesaria para continuar.",
        );
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const token = localStorage.getItem("jwt");

  if (!token) {
    return (
      <main className="brief-details">No se encontró una sesión activa.</main>
    );
  }

  if (isLoading) {
    return <main className="brief-details">Cargando brief...</main>;
  }

  if (!brief || !template) {
    return (
      <main className="brief-details">
        {errorMessage || "No se encontró el brief."}
      </main>
    );
  }

  const isCompleted = brief.status === "completed";

  return (
    <>
      <Header />

      <main className="brief-details">
        <div className="brief-details__container">
          <span className="brief-details__eyebrow">Onboarding BeeUX</span>

          <h1 className="brief-details__title">{template.title}</h1>

          <p className="brief-details__description">
            Cuéntanos sobre tu negocio para que podamos preparar correctamente
            tu servicio.
          </p>

          <div className="brief-details__status">
            Estado: <strong>{brief.status}</strong>
          </div>

          <div className="brief-details__card">
            {template.questions.map((question) => (
              <div className="brief-details__field" key={question.id}>
                <label htmlFor={question.id}>
                  {question.label}

                  {question.required && (
                    <span className="brief-details__required"> *</span>
                  )}
                </label>

                {question.type === "textarea" ? (
                  <textarea
                    id={question.id}
                    value={answers[question.id] || ""}
                    onChange={(event) =>
                      handleChange(question.id, event.target.value)
                    }
                    disabled={isCompleted}
                    rows="5"
                  />
                ) : (
                  <input
                    id={question.id}
                    type="text"
                    value={answers[question.id] || ""}
                    onChange={(event) =>
                      handleChange(question.id, event.target.value)
                    }
                    disabled={isCompleted}
                  />
                )}
              </div>
            ))}

            {errorMessage && (
              <p className="brief-details__error">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="brief-details__success">{successMessage}</p>
            )}

            {!isCompleted ? (
              <div className="brief-details__actions">
                <button
                  className="brief-details__button brief-details__button--secondary"
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitting}
                >
                  {isSaving ? "Guardando..." : "Guardar y continuar después"}
                </button>

                <button
                  className="brief-details__button"
                  type="button"
                  onClick={handleCompleteBrief}
                  disabled={isSaving || isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Completar brief"}
                </button>
              </div>
            ) : (
              <div className="brief-details__completed">Brief completado ✓</div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default BriefDetails;
