const Stripe = require("stripe");
const Order = require("../models/order");
const Service = require("../models/service");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createOrder = (req, res, next) => {
  const { serviceSlug, billingType = "one-time" } = req.body;

  Service.findOne({
    slug: serviceSlug,
    active: true,
  })
    .then((service) => {
      if (!service) {
        const error = new Error("Service not found");
        error.statusCode = 404;
        throw error;
      }

      let amount = service.price;

      if (billingType === "yearly") {
        if (!service.yearlyPrice) {
          const error = new Error(
            "Yearly billing is not available for this service",
          );
          error.statusCode = 400;
          throw error;
        }

        amount = service.yearlyPrice;
      }

      return Order.create({
        user: req.user._id,
        service: service._id,
        serviceName: service.name,
        serviceSlug: service.slug,
        amount,
        currency: service.currency,
        billingType,
      });
    })
    .then((order) => {
      res.status(201).send(order);
    })
    .catch(next);
};

const getOrderById = (req, res, next) => {
  Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  })
    .then((order) => {
      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      res.send(order);
    })
    .catch(next);
};

const createCheckoutSession = (req, res, next) => {
  const { orderId } = req.body;

  Order.findOne({
    _id: orderId,
    user: req.user._id,
  })
    .then((order) => {
      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status !== "pending") {
        const error = new Error("Order is not available for payment");
        error.statusCode = 400;
        throw error;
      }

      return stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: order.currency.toLowerCase(),

              product_data: {
                name: order.serviceName,
              },

              unit_amount: Math.round(order.amount * 100),
            },

            quantity: 1,
          },
        ],

        success_url: `http://localhost:5173/checkout/success?orderId=${order._id}`,
        cancel_url: `http://localhost:5173/checkout/${order._id}`,

        metadata: {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      });
    })
    .then((session) =>
      Order.findByIdAndUpdate(
        orderId,
        {
          stripeCheckoutSessionId: session.id,
        },
        {
          new: true,
        },
      ).then(() => session),
    )
    .then((session) => {
      res.send({
        url: session.url,
      });
    })
    .catch(next);
};

module.exports = {
  createOrder,
  getOrderById,
  createCheckoutSession,
};
