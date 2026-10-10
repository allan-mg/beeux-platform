const Stripe = require("stripe");

const Order = require("../models/order");
const Contract = require("../models/contract");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send({
      message: `Webhook error: ${error.message}`,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            status: "paid",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent || null,
          },
          {
            returnDocument: "after",
          },
        );

        if (order) {
          await Contract.findOneAndUpdate(
            {
              order: order._id,
            },
            {
              $setOnInsert: {
                user: order.user,
                order: order._id,
                service: order.service,
                serviceName: order.serviceName,
                status: "awaiting_legal_data",
              },
            },
            {
              returnDocument: "after",
              upsert: true,
            },
          );
        }
      }
    }

    return res.status(200).send({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return res.status(500).send({
      message: "Webhook processing error",
    });
  }
};

module.exports = {
  handleStripeWebhook,
};
