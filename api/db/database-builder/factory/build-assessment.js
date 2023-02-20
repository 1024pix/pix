import buildCertificationCourse from './build-certification-course';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';
import Assessment from '../../../lib/domain/models/Assessment';
import _ from 'lodash';

export default function buildAssessment({
  id = databaseBuffer.getNextId(),
  courseId = 'recDefaultCourseId',
  certificationCourseId,
  userId,
  type = Assessment.types.COMPETENCE_EVALUATION,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  lastQuestionDate = new Date(),
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  competenceId = 'recCompetenceId',
  campaignParticipationId = null,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  method,
} = {}) {
  if (type !== Assessment.types.DEMO) {
    userId = _.isUndefined(userId) ? buildUser().id : userId;
  }

  if (type === Assessment.types.CERTIFICATION) {
    certificationCourseId = _.isUndefined(certificationCourseId)
      ? buildCertificationCourse({ userId }).id
      : certificationCourseId;
  }

  const values = {
    id,
    courseId,
    certificationCourseId,
    userId,
    type,
    isImproving,
    state,
    lastQuestionDate,
    lastChallengeId,
    lastQuestionState,
    createdAt,
    updatedAt,
    competenceId,
    campaignParticipationId,
    method,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
}
