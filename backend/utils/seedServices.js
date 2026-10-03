require("dotenv").config();

const mongoose = require("mongoose");
const Service = require("../models/service");

const services = [
  {
    name: "Plan Esencial",
    slug: "plan-esencial",
    category: "social-media",
    shortDescription: "Administración de 1 red social",
    description:
      "Plan ideal para negocios que buscan comenzar con una presencia profesional en redes sociales.",
    features: [
      "1 red social",
      "Community Manager",
      "Diseño de contenido",
      "Trafficker",
      "Reporte mensual",
    ],
    price: 230,
    yearlyPrice: 2300,
    currency: "USD",
    billingType: "monthly",
    active: true,
    featured: false,
    deliveryTime: "Inicio el mismo día con información completa",
  },
  {
    name: "Plan Indispensable",
    slug: "plan-indispensable",
    category: "social-media",
    shortDescription: "Administración de 2 redes sociales",
    description:
      "Plan para marcas que necesitan presencia constante en más de una red social.",
    features: [
      "2 redes sociales",
      "Community Manager",
      "Diseño de contenido",
      "Trafficker",
      "Reporte mensual",
    ],
    price: 253,
    yearlyPrice: 2530,
    currency: "USD",
    billingType: "monthly",
    active: true,
    featured: false,
    deliveryTime: "Inicio el mismo día con información completa",
  },
  {
    name: "Plan Todo en Uno",
    slug: "plan-todo-en-uno",
    category: "social-media",
    shortDescription: "Administración de 3 redes sociales",
    description:
      "Plan pensado para negocios que necesitan una estrategia multicanal.",
    features: [
      "3 redes sociales",
      "Community Manager",
      "Diseño de contenido",
      "Trafficker",
      "Reporte mensual",
    ],
    price: 287.5,
    yearlyPrice: 2875,
    currency: "USD",
    billingType: "monthly",
    active: true,
    featured: false,
    deliveryTime: "Inicio el mismo día con información completa",
  },
  {
    name: "Plan Profesional",
    slug: "plan-profesional",
    category: "social-media",
    shortDescription: "Administración de 4 redes sociales",
    description:
      "Plan para marcas en crecimiento que necesitan una presencia sólida en múltiples canales.",
    features: [
      "4 redes sociales",
      "Community Manager",
      "Diseño de contenido",
      "Trafficker",
      "Reporte mensual",
    ],
    price: 322,
    yearlyPrice: 3220,
    currency: "USD",
    billingType: "monthly",
    active: true,
    featured: true,
    deliveryTime: "Inicio el mismo día con información completa",
  },
  {
    name: "Plan Omnipresente",
    slug: "plan-omnipresente",
    category: "social-media",
    shortDescription: "Administración de 6 redes sociales",
    description:
      "Plan integral para marcas que buscan presencia activa en múltiples plataformas.",
    features: [
      "6 redes sociales",
      "Community Manager",
      "Diseño de contenido",
      "Trafficker",
      "Reporte mensual",
    ],
    price: 356,
    yearlyPrice: 3565,
    currency: "USD",
    billingType: "monthly",
    active: true,
    featured: false,
    deliveryTime: "Inicio el mismo día con información completa",
  },
];

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    await Service.deleteMany({ category: "social-media" });

    await Service.insertMany(services);

    console.log("Social Media services inserted successfully");

    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
