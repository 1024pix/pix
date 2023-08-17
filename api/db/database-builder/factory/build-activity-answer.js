import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildActivity } from './build-activity.js';

const buildActivityAnswer = function ({
  id = databaseBuffer.getNextId(),
  challengeId = 'rec123ABC',
  activityId = null,
  value = 'Some value for answer',
  result = 'Some result for answer',
  resultDetails = 'Some result details for answer.',
  createdAt = new Date('2020-01-01'),
} = {}) {
  activityId = _.isUndefined(activityId) ? buildActivity().id : activityId;

  const values = {
    id,
    challengeId,
    activityId,
    value,
    result,
    resultDetails,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'activity-answers',
    values,
  });
};

export { buildActivityAnswer };
