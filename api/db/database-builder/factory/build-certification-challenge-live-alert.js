import _ from 'lodash';

import { Assessment } from '../../../lib/domain/models/index.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAssessment } from './build-assessment.js';

const buildCertificationChallengeLiveAlert = function ({
  id = databaseBuffer.getNextId(),
  assessmentId,
  challengeId = 'rec123',
  status = 'ongoing',
  questionNumber = 1,
  hasEmbed = false,
  isFocus = false,
  hasImage = false,
  hasAttachment = false,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ state: Assessment.states.STARTED }).id : assessmentId;

  const values = {
    id,
    assessmentId,
    challengeId,
    questionNumber,
    status,
    hasEmbed,
    isFocus,
    hasAttachment,
    hasImage,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenge-live-alerts',
    values,
  });
};

export { buildCertificationChallengeLiveAlert };
