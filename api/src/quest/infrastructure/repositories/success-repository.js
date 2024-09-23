import { Success } from '../../domain/models/Success.js';

export const find = async ({ userId, skillIds, knowledgeElementsApi }) => {
  const knowledgeElements = await knowledgeElementsApi.findFilteredMostRecentByUser({ userId, skillIds });
  return new Success({ knowledgeElements });
};
