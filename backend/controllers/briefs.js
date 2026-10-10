const Brief = require("../models/brief");
const briefTemplates = require("../config/briefTemplates");
const { createProjectFromBrief } = require("../utils/projectFlow");

const getBriefByOrder = async (req, res, next) => {
  try {
    const brief = await Brief.findOne({
      order: req.params.orderId,
      user: req.user._id,
    });

    if (!brief) {
      const error = new Error("Brief not found");
      error.statusCode = 404;
      throw error;
    }

    const template =
      briefTemplates[brief.serviceSlug] || briefTemplates.default;

    res.send({
      brief,
      template,
    });
  } catch (error) {
    next(error);
  }
};

const updateBriefByOrder = async (req, res, next) => {
  try {
    const { answers, completed = false } = req.body;

    if (!answers || typeof answers !== "object") {
      const error = new Error("Las respuestas del brief son obligatorias.");
      error.statusCode = 400;
      throw error;
    }

    const brief = await Brief.findOne({
      order: req.params.orderId,
      user: req.user._id,
    });

    if (!brief) {
      const error = new Error("Brief not found");
      error.statusCode = 404;
      throw error;
    }

    const template =
      briefTemplates[brief.serviceSlug] || briefTemplates.default;

    if (completed) {
      const missingQuestions = template.questions.filter((question) => {
        if (!question.required) {
          return false;
        }

        const answer = answers[question.id];

        return (
          answer === undefined ||
          answer === null ||
          String(answer).trim() === ""
        );
      });

      if (missingQuestions.length > 0) {
        const error = new Error(
          "Debes responder todas las preguntas obligatorias antes de completar el brief.",
        );

        error.statusCode = 400;
        throw error;
      }
    }

    brief.answers = answers;

    if (completed) {
      brief.status = "completed";
      brief.completedAt = new Date();
    } else {
      brief.status = "in_progress";
      brief.completedAt = null;
    }

    await brief.save();

    let project = null;

    if (completed) {
      project = await createProjectFromBrief(brief);
    }

    res.send({
      brief,
      template,
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBriefByOrder,
  updateBriefByOrder,
};
