import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildPix1dAssessment } from './build-assessment.js';
import { buildOrganizationLearner } from './build-organization-learner.js';

const buildMissionAssessment = function ({
  missionId = 'recMissionId',
  assessmentId,
  organizationLearnerId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildPix1dAssessment().id : assessmentId;
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
