import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationCourse } from './build-certification-course.js';

const buildCertificationChallenge = function ({
  id = databaseBuffer.getNextId(),
  associatedSkillName = '@twi8',
  associatedSkillId = 'recSKIL123',
  challengeId = 'recCHAL456',
  competenceId = 'recCOMP789',
  courseId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  isNeutralized = false,
  hasBeenSkippedAutomatically = false,
  certifiableBadgeKey = null,
} = {}) {
  courseId = _.isUndefined(courseId) ? buildCertificationCourse().id : courseId;

  const values = {
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    competenceId,
    courseId,
    createdAt,
    updatedAt,
    isNeutralized,
    hasBeenSkippedAutomatically,
    certifiableBadgeKey,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenges',
    values,
  });
};

export { buildCertificationChallenge };
