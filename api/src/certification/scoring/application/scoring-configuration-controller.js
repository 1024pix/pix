import { usecases } from '../domain/usecases/index.js';

const saveCompetenceForScoringConfiguration = async (request, h) => {
  const data = request.payload;
  await usecases.saveCompetenceForScoringConfiguration({ data });
  return h.response().code(201);
};

export const competenceForScoringConfigurationController = {
  saveCompetenceForScoringConfiguration,
};
