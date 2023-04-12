const usecases = require('../../domain/usecases/index.js');
const competenceEvaluationSerializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

module.exports = {
  async startOrResume(request, h, dependencies = { competenceEvaluationSerializer }) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.competenceId;

    const { competenceEvaluation, created } = await usecases.startOrResumeCompetenceEvaluation({
      competenceId,
      userId,
    });
    const serializedCompetenceEvaluation = dependencies.competenceEvaluationSerializer.serialize(competenceEvaluation);

    return created ? h.response(serializedCompetenceEvaluation).created() : serializedCompetenceEvaluation;
  },

  async improve(request, h, dependencies = { competenceEvaluationSerializer }) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.competenceId;

    const competenceEvaluation = await DomainTransaction.execute(async (domainTransaction) => {
      const competenceEvaluation = await usecases.improveCompetenceEvaluation({
        competenceId,
        userId,
        domainTransaction,
      });
      return competenceEvaluation;
    });

    const serializedCompetenceEvaluation = dependencies.competenceEvaluationSerializer.serialize(competenceEvaluation);
    return h.response(serializedCompetenceEvaluation);
  },
};
