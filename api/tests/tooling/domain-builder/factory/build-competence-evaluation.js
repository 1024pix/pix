import CompetenceEvaluation from '../../../../lib/domain/models/CompetenceEvaluation';
import buildAssessment from './build-assessment';
import buildUser from './build-user';

export default function buildCompetenceEvaluation({
  id = 1,
  assessmentId,
  assessment,
  status = 'started',
  userId = buildUser().id,
  competenceId = 'recsvLz0W2ShyfD63',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {
  if (assessment && !assessmentId) {
    assessmentId = assessment.id;
  }
  if (assessmentId && !assessment) {
    assessment = buildAssessment({ id: assessmentId });
  }
  if (!assessmentId && !assessment) {
    assessment = buildAssessment();
    assessmentId = assessment.id;
  }

  return new CompetenceEvaluation({
    id,
    assessmentId,
    userId,
    competenceId,
    createdAt,
    updatedAt,
    assessment,
    status,
  });
}
