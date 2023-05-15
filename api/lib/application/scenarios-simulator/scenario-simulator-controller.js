const usecases = require('../../domain/usecases');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async simulateFlashDeterministicAssessmentScenario(request, h) {
    const { assessmentId, simulationAnswers } = request.payload;
    const locale = extractLocaleFromRequest(request);

    const { challenges, estimatedLevel } = await usecases.simulateFlashDeterministicAssessmentScenario({
      simulationAnswers,
      assessmentId,
      locale,
    });

    return h.response({
      challenges,
      estimatedLevel,
    });
  },
};
