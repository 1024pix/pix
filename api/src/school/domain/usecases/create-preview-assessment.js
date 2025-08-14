import { Assessment } from '../../../shared/domain/models/Assessment.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';

const createPreviewAssessment = async function ({ assessmentRepository = injectedAssessmentRepository } = {}) {
  const assessment = new Assessment({ type: Assessment.types.PREVIEW });
  return assessmentRepository.save({ assessment });
};

export { createPreviewAssessment };
