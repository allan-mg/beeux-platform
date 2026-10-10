const briefTemplates = {
  "plan-esencial": {
    title: "Brief de redes sociales — Plan Esencial",

    questions: [
      {
        id: "businessName",
        label: "Nombre de tu negocio o marca",
        type: "text",
        required: true,
      },

      {
        id: "businessDescription",
        label: "Describe brevemente tu negocio",
        type: "textarea",
        required: true,
      },

      {
        id: "mainGoal",
        label: "¿Cuál es tu principal objetivo en redes sociales?",
        type: "textarea",
        required: true,
      },

      {
        id: "targetAudience",
        label: "Describe a tu público objetivo",
        type: "textarea",
        required: true,
      },

      {
        id: "socialPlatforms",
        label: "¿Qué redes sociales utilizas actualmente?",
        type: "textarea",
        required: true,
      },

      {
        id: "brandTone",
        label: "¿Cómo quieres que se comunique tu marca?",
        type: "textarea",
        required: true,
      },

      {
        id: "competitors",
        label: "¿Quiénes son tus principales competidores?",
        type: "textarea",
        required: false,
      },

      {
        id: "contentReferences",
        label: "Comparte marcas o cuentas cuyo contenido te guste",
        type: "textarea",
        required: false,
      },

      {
        id: "availableAssets",
        label:
          "¿Qué materiales tienes disponibles? Logo, fotografías, videos, manual de marca, etc.",
        type: "textarea",
        required: true,
      },

      {
        id: "additionalNotes",
        label: "¿Hay algo más que debamos saber?",
        type: "textarea",
        required: false,
      },
    ],
  },

  "plan-profesional": {
    title: "Brief de redes sociales — Plan Profesional",

    questions: [
      {
        id: "businessName",
        label: "Nombre de tu negocio o marca",
        type: "text",
        required: true,
      },

      {
        id: "businessDescription",
        label: "Describe brevemente tu negocio",
        type: "textarea",
        required: true,
      },

      {
        id: "mainGoal",
        label: "¿Cuál es tu principal objetivo?",
        type: "textarea",
        required: true,
      },

      {
        id: "targetAudience",
        label: "Describe a tu público objetivo",
        type: "textarea",
        required: true,
      },

      {
        id: "socialPlatforms",
        label: "¿Qué redes sociales utilizas actualmente?",
        type: "textarea",
        required: true,
      },

      {
        id: "brandTone",
        label: "¿Cómo quieres que se comunique tu marca?",
        type: "textarea",
        required: true,
      },

      {
        id: "competitors",
        label: "¿Quiénes son tus principales competidores?",
        type: "textarea",
        required: false,
      },

      {
        id: "availableAssets",
        label: "¿Qué materiales de marca tienes disponibles?",
        type: "textarea",
        required: true,
      },

      {
        id: "additionalNotes",
        label: "Información adicional",
        type: "textarea",
        required: false,
      },
    ],
  },

  "plan-omnipresente": {
    title: "Brief de redes sociales — Plan Omnipresente",

    questions: [
      {
        id: "businessName",
        label: "Nombre de tu negocio o marca",
        type: "text",
        required: true,
      },

      {
        id: "businessDescription",
        label: "Describe brevemente tu negocio",
        type: "textarea",
        required: true,
      },

      {
        id: "mainGoal",
        label: "¿Cuál es tu principal objetivo?",
        type: "textarea",
        required: true,
      },

      {
        id: "targetAudience",
        label: "Describe a tu público objetivo",
        type: "textarea",
        required: true,
      },

      {
        id: "socialPlatforms",
        label: "Indica todas las plataformas en las que deseas trabajar",
        type: "textarea",
        required: true,
      },

      {
        id: "brandTone",
        label: "Describe el tono y personalidad de tu marca",
        type: "textarea",
        required: true,
      },

      {
        id: "competitors",
        label: "¿Quiénes son tus principales competidores?",
        type: "textarea",
        required: false,
      },

      {
        id: "availableAssets",
        label: "¿Qué materiales y recursos de marca tienes disponibles?",
        type: "textarea",
        required: true,
      },

      {
        id: "additionalNotes",
        label: "Información adicional",
        type: "textarea",
        required: false,
      },
    ],
  },

  default: {
    title: "Brief del servicio",

    questions: [
      {
        id: "businessName",
        label: "Nombre de tu negocio o marca",
        type: "text",
        required: true,
      },

      {
        id: "businessDescription",
        label: "Describe brevemente tu negocio",
        type: "textarea",
        required: true,
      },

      {
        id: "mainGoal",
        label: "¿Cuál es el principal objetivo de este servicio?",
        type: "textarea",
        required: true,
      },

      {
        id: "targetAudience",
        label: "Describe a tu público objetivo",
        type: "textarea",
        required: true,
      },

      {
        id: "availableAssets",
        label: "¿Qué materiales tienes disponibles?",
        type: "textarea",
        required: false,
      },

      {
        id: "additionalNotes",
        label: "Información adicional",
        type: "textarea",
        required: false,
      },
    ],
  },
};

module.exports = briefTemplates;
