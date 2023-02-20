import usecases from '../../domain/usecases';
import serializer from '../../infrastructure/serializers/jsonapi/competence-evaluation-serializer';
import DomainTransaction from '../../infrastructure/DomainTransaction';

export default {
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
