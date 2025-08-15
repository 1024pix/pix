import * as injectedLlmApi from '../../../llm/application/api/llm-api.js';
import { DomainError } from '../../../shared/domain/errors.js';
import * as injectedPassageRepository from '../../infrastructure/repositories/passage-repository.js';

export async function startEmbedLlmChat({
  configId,
  userId,
  passageId,
  llmApi = injectedLlmApi,
  passageRepository = injectedPassageRepository,
} = {}) {
  await checkIfPassageBelongsToUser(passageId, userId, passageRepository);
  return await llmApi.startChat({ configId, userId, passageId });
}

async function checkIfPassageBelongsToUser(passageId, userId, passageRepository) {
  const passage = await passageRepository.get({ passageId });
  if (passage.userId !== userId) throw new DomainError(`This passage does not belong to user`);
}
