import { UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';

const findCompetenceEvaluationsByAssessment = async function ({
  userId,
  assessmentId,
  assessmentRepository = injectedAssessmentRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
} = {}) {
  if (!(await assessmentRepository.ownedByUser({ id: assessmentId, userId }))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this competence evaluation');
  }

  return competenceEvaluationRepository.findByAssessmentId(assessmentId);
};

export { findCompetenceEvaluationsByAssessment };
