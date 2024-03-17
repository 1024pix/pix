import { usecases } from '../domain/usecases/index.js';

const saveCompetenceForScoringConfiguration = async (request, h) => {
  const data = request.payload;
  await usecases.saveCompetenceForScoringConfiguration({ data });
  return h.response().code(201);
};

const saveCertificationScoringConfiguration = async (request, h) => {
  const data = request.payload;
  const userId = request.auth.credentials.userId;
  await usecases.saveCertificationScoringConfiguration({ data, userId });
  return h.response().code(201);
};

export const scoringConfigurationController = {
  saveCompetenceForScoringConfiguration,
  saveCertificationScoringConfiguration,
};
