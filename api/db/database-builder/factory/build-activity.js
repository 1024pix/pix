import { buildAssessment } from './build-assessment.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';
import { Activity } from '../../../lib/domain/models/Activity.js';

const buildActivity = function ({
  id = databaseBuffer.getNextId(),
  assessmentId,
  level = Activity.levels.TUTORIAL,
  createdAt = new Date('2020-01-01'),
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment().id : assessmentId;

  const values = {
    id,
    assessmentId,
    level,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'activities',
    values,
  });
};

export { buildActivity };
