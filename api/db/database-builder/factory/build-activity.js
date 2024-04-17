import _ from 'lodash';

import { Activity } from '../../../src/school/domain/models/Activity.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildPix1dAssessment } from './build-assessment.js';

const buildActivity = function ({
  id = databaseBuffer.getNextId(),
  assessmentId,
  level = Activity.levels.TUTORIAL,
  createdAt = new Date('2020-01-01'),
  status = Activity.status.STARTED,
  stepIndex,
  alternativeVersion = 0,
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildPix1dAssessment().id : assessmentId;

  const values = {
    id,
    assessmentId,
    level,
    createdAt,
    status,
    alternativeVersion,
    stepIndex,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'activities',
    values,
  });
};

export { buildActivity };
