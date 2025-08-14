import * as injectedLlmApi from '../../../llm/application/api/llm-api.js';
import { DomainError } from '../../../shared/domain/errors.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';

export async function promptToLLMChat({
  userId,
  assessmentId,
  chatId,
  prompt,
  attachmentName,
  llmApi = injectedLlmApi,
  assessmentRepository = injectedAssessmentRepository,
} = {}) {
  await checkIfAssessmentBelongsToUser(assessmentId, userId, assessmentRepository);
  return llmApi.prompt({
    chatId,
    userId,
    message: prompt || null,
    attachmentName: attachmentName || null,
  });
}

async function checkIfAssessmentBelongsToUser(assessmentId, userId, assessmentRepository) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId !== userId) throw new DomainError(`This assessment does not belong to user`);
}
