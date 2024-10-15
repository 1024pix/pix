import _ from 'lodash';

import { CertificationCompanionLiveAlertStatus } from '../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Assessment } from '../../../src/shared/domain/models/index.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAssessment } from './build-assessment.js';

const buildCertificationCompanionLiveAlert = function ({
  id = databaseBuffer.getNextId(),
  assessmentId,
  status = CertificationCompanionLiveAlertStatus.ONGOING,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ state: Assessment.states.STARTED }).id : assessmentId;

  const values = {
    id,
    assessmentId,
    status,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-companion-live-alerts',
    values,
  });
};

export { buildCertificationCompanionLiveAlert };
