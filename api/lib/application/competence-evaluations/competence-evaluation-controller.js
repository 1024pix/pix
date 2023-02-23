const usecases = require('../../domain/usecases/index.js');
const serializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

module.exports = {
  async startOrResume(request, h) {
    const userId = request.auth.credentials.userId;
    const competenceId = request.payload.competenceId;

    const { competenceEvaluation, created } = await usecases.startOrResumeCompetenceEvaluation({
      competenceId,
      userId,
    });
    const serializedCompetenceEvaluation = serializer.serialize(competenceEvaluation);

    return created ? h.response(serializedCompetenceEvaluation).created() : serializedCompetenceEvaluation;
  },

  async improve(request, h) {
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

    const serializedCompetenceEvaluation = serializer.serialize(competenceEvaluation);
    return h.response(serializedCompetenceEvaluation);
  },
};
