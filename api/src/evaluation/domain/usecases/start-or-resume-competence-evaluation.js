import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from '../models/CompetenceEvaluation.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

const startOrResumeCompetenceEvaluation = async function ({
  competenceId,
  userId,
  competenceEvaluationRepository,
  assessmentRepository,
  competenceRepository,
}) {
  await _checkCompetenceExists(competenceId, competenceRepository);

  try {
    return await _resumeCompetenceEvaluation({
      userId,
      competenceId,
      assessmentRepository,
      competenceEvaluationRepository,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return await _startCompetenceEvaluation({
        userId,
        competenceId,
        assessmentRepository,
        competenceEvaluationRepository,
      });
    } else {
      throw err;
    }
  }
};

export { startOrResumeCompetenceEvaluation };

function _checkCompetenceExists(competenceId, competenceRepository) {
  return competenceRepository.get({ id: competenceId });
}

async function _resumeCompetenceEvaluation({
  userId,
  competenceId,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  const competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
    competenceId,
    userId,
  });

  if (competenceEvaluation.status === CompetenceEvaluation.statuses.RESET) {
    return _restartCompetenceEvaluation({
      userId,
      competenceEvaluation,
      assessmentRepository,
      competenceEvaluationRepository,
    });
  }

  return { competenceEvaluation, created: false };
}

async function _startCompetenceEvaluation({
  userId,
  competenceId,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  const assessment = await _createAssessment({ userId, competenceId, assessmentRepository });
  const competenceEvaluation = await _createCompetenceEvaluation(
    competenceId,
    assessment.id,
    userId,
    competenceEvaluationRepository,
  );

  return { competenceEvaluation, created: true };
}

function _createAssessment({ userId, competenceId, assessmentRepository }) {
  const assessment = Assessment.createForCompetenceEvaluation({ userId, competenceId });
  return assessmentRepository.save({ assessment });
}

function _createCompetenceEvaluation(competenceId, assessmentId, userId, competenceEvaluationRepository) {
  const competenceEvaluation = new CompetenceEvaluation({
    userId,
    assessmentId,
    competenceId,
    status: CompetenceEvaluation.statuses.STARTED,
  });
  return competenceEvaluationRepository.save({ competenceEvaluation });
}

async function _restartCompetenceEvaluation({
  userId,
  competenceEvaluation,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  const assessment = await _createAssessment({
    userId,
    competenceId: competenceEvaluation.competenceId,
    assessmentRepository,
  });
  await competenceEvaluationRepository.updateAssessmentId({
    currentAssessmentId: competenceEvaluation.assessmentId,
    newAssessmentId: assessment.id,
  });
  await competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
    userId,
    competenceId: competenceEvaluation.competenceId,
    status: CompetenceEvaluation.statuses.STARTED,
  });
  const updatedCompetenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
    userId,
    competenceId: competenceEvaluation.competenceId,
  });

  return { competenceEvaluation: updatedCompetenceEvaluation, created: false };
}
