import * as injectedLlmApi from '../../../llm/application/api/llm-api.js';
import { DomainError } from '../../../shared/domain/errors.js';

export async function promptToLLMChat({
  userId,
  passageId,
  chatId,
  prompt,
  attachmentName,
  llmApi = injectedLlmApi,
  passageRepository,
} = {}) {
  await checkIfPassageBelongsToUser(passageId, userId, passageRepository);
  return llmApi.prompt({
    chatId,
    userId,
    message: prompt || null,
    attachmentName: attachmentName || null,
  });
}

async function checkIfPassageBelongsToUser(passageId, userId, passageRepository) {
  const passage = await passageRepository.get({ passageId });
  if (passage.userId !== userId) throw new DomainError(`This passage does not belong to user`);
}
