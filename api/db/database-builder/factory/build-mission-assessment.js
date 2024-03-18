import _ from 'lodash';

import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildPix1dAssessment } from './build-assessment.js';
import { buildOrganizationLearner } from './build-organization-learner.js';

const buildMissionAssessment = function ({
  missionId = 'recMissionId',
  assessmentId,
  organizationLearnerId,
  createdAt = new Date('2020-01-01'),
  state = Assessment.states.STARTED,
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildPix1dAssessment({ state }).id : assessmentId;
  organizationLearnerId = _.isUndefined(organizationLearnerId) ? buildOrganizationLearner().id : organizationLearnerId;

  const values = {
    missionId,
    assessmentId,
    organizationLearnerId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'mission-assessments',
    values,
  });
};

export { buildMissionAssessment };
