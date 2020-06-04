const { BadRequestError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = {

  async startOrResume(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.competenceId;

    const { competenceEvaluation, created } = await usecases.startOrResumeCompetenceEvaluation({ competenceId, userId });
    const serializedCompetenceEvaluation = serializer.serialize(competenceEvaluation);

    return created ? h.response(serializedCompetenceEvaluation).created() : serializedCompetenceEvaluation;
  },

  async find(request) {
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    if (!options.filter.assessmentId) {
      throw new BadRequestError('Competence evaluation must be fetched by assessmentId');
    }

    const { models: competenceEvaluations } = await usecases.findCompetenceEvaluations({ userId, options });

    return serializer.serialize(competenceEvaluations);
  },

  async improve(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.competenceId;

    const competenceEvaluation = await DomainTransaction.execute((domainTransaction) =>
      usecases.improveCompetenceEvaluation({ competenceId, userId, domainTransaction })
    );

    const serializedCompetenceEvaluation = serializer.serialize(competenceEvaluation);
    return h.response(serializedCompetenceEvaluation);
  }
};
