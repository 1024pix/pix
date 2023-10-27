import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';
import { buildPix1dAssessment } from './build-assessment.js';

const buildMissionAssessment = function ({
  missionId = 'recMissionId',
  assessmentId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildPix1dAssessment({ missionId }).id : assessmentId;

  const values = {
    missionId,
    assessmentId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'mission-assessments',
    values,
  });
};

export { buildMissionAssessment };
