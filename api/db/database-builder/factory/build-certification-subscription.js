import _ from 'lodash';

import { SubscriptionTypes } from '../../../src/certification/shared/domain/models/SubscriptionTypes.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationCandidate } from './build-certification-candidate.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';

const buildCoreSubscription = ({ certificationCandidateId, createdAt = new Date('2020-01-01') } = {}) => {
  certificationCandidateId = certificationCandidateId ?? buildCertificationCandidate().id;

  return databaseBuffer.pushInsertable({
    tableName: 'certification-subscriptions',
    values: {
      certificationCandidateId,
      createdAt,
      type: SubscriptionTypes.CORE,
    },
  });
};

const buildComplementaryCertificationSubscription = function ({
  certificationCandidateId,
  complementaryCertificationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  certificationCandidateId = _.isNull(certificationCandidateId)
    ? buildCertificationCandidate().id
    : certificationCandidateId;
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;

  return databaseBuffer.pushInsertable({
    tableName: 'certification-subscriptions',
    values: {
      certificationCandidateId,
      complementaryCertificationId,
      createdAt,
      type: SubscriptionTypes.COMPLEMENTARY,
    },
  });
};

export { buildComplementaryCertificationSubscription, buildCoreSubscription };
