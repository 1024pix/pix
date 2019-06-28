const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { BadRequestError } = require('../../infrastructure/errors');

module.exports = {

  start(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.data.attributes['competence-id'];
    return usecases.startOrResumeCompetenceEvaluation({ competenceId, userId })
      .then(({ created, competenceEvaluation }) => {
        const serialized = serializer.serialize(competenceEvaluation);
        return created ? h.response(serialized).created() : serialized;
      });
  },

  async find(request) {
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    if (!options.filter.assessmentId && !options.filter.competenceId) {
      throw new BadRequestError('Competence evalutation must be fetched by assessmentId or competenceId');
    }

    const { models: competenceEvaluations } = await usecases.findCompetenceEvaluations({ userId, options });
    
    return serializer.serialize(competenceEvaluations);
  },
};
