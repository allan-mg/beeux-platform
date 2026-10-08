const Stripe = require("stripe");
const Order = require("../models/order");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = (req, res) => {
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      Order.findByIdAndUpdate(orderId, {
        status: "paid",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || null,
      }).catch((error) => {
        console.error("Error updating order:", error);
      });
    }
  }

  return res.status(200).send({
    received: true,
  });
};

module.exports = {
  handleStripeWebhook,
};
