import { usecases } from '../../domain/usecases/index.js';
import * as competenceEvaluationSerializer from '../../infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const startOrResume = async function (request, h, dependencies = { competenceEvaluationSerializer }) {
  const userId = request.auth.credentials.userId;
  const competenceId = request.payload.competenceId;

  const { competenceEvaluation, created } = await usecases.startOrResumeCompetenceEvaluation({
    competenceId,
    userId,
  });
  const serializedCompetenceEvaluation = dependencies.competenceEvaluationSerializer.serialize(competenceEvaluation);

  return created ? h.response(serializedCompetenceEvaluation).created() : serializedCompetenceEvaluation;
};

const improve = async function (request, h, dependencies = { competenceEvaluationSerializer }) {
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
};

export { startOrResume, improve };
