import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.ts';
import { buildAssessment } from './build-assessment.js';

/**
 * @param {{
 *   id?: number,
 *   value?: string,
 *   result?: string,
 *   assessmentId?: number,
 *   challengeId?: string,
 *   createdAt?: Date,
 *   updatedAt?: Date,
 *   timeout?: number | null,
 *   resultDetails?: string,
 *   isFocusedOut?: boolean,
 *   timeSpent?: number,
 * }} [attributes]
 */
const buildAnswer = function ({
  id = databaseBuffer.getNextId(),
  value = 'Some value for answer',
  result = 'Some result for answer',
  assessmentId,
  challengeId = 'rec123ABC',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  timeout = null,
  resultDetails = 'Some result details for answer.',
  isFocusedOut = false,
  timeSpent = 30,
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment().id : assessmentId;

  const values = {
    id,
    value,
    result,
    assessmentId,
    challengeId,
    createdAt,
    updatedAt,
    timeout,
    resultDetails,
    isFocusedOut,
    timeSpent,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });
};

export { buildAnswer };
