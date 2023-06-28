import { Assessment } from '../models/index.js';

const createPreviewAssessment = async function ({ assessmentRepository }) {
  const assessment = new Assessment({ type: Assessment.types.PREVIEW });
  return assessmentRepository.save({ assessment });
};

export { createPreviewAssessment };
