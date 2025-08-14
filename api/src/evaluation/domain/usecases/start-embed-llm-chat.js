import * as injectedLlmApi from '../../../llm/application/api/llm-api.js';
import { DomainError } from '../../../shared/domain/errors.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';

export async function startEmbedLlmChat({
  configId,
  userId,
  assessmentId,
  llmApi = injectedLlmApi,
  assessmentRepository = injectedAssessmentRepository,
} = {}) {
  await checkIfAssessmentBelongsToUser(assessmentId, userId, assessmentRepository);
  return await llmApi.startChat({ configId, userId, assessmentId });
}

async function checkIfAssessmentBelongsToUser(assessmentId, userId, assessmentRepository) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId !== userId) throw new DomainError(`This assessment does not belong to user`);
}
