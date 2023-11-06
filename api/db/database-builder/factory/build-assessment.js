import { buildCertificationCourse } from './build-certification-course.js';
import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import _ from 'lodash';

const buildAssessment = function ({
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
};
const buildPix1dAssessment = function ({
  id = databaseBuffer.getNextId(),
  type = Assessment.types.PIX1D_MISSION,
  state = Assessment.states.STARTED,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  method = Assessment.methods.PIX1D,
} = {}) {
  const values = {
    id,
    type,
    state,
    createdAt,
    updatedAt,
    method,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
};

export { buildAssessment, buildPix1dAssessment };
