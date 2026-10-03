const router = require("express").Router();

const { getServices, getServiceBySlug } = require("../controllers/services");

router.get("/", getServices);

router.get("/:slug", getServiceBySlug);

module.exports = router;
