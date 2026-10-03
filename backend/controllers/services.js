const Service = require("../models/service");

const getServices = (req, res, next) => {
  Service.find({ active: true })
    .then((services) => {
      res.send(services);
    })
    .catch(next);
};

const getServiceBySlug = (req, res, next) => {
  const { slug } = req.params;

  Service.findOne({ slug, active: true })
    .then((service) => {
      if (!service) {
        return res.status(404).send({
          message: "Service not found",
        });
      }

      return res.send(service);
    })
    .catch(next);
};

module.exports = {
  getServices,
  getServiceBySlug,
};
