import _ from 'lodash';
import { buildCertificationCandidate } from './build-certification-candidate.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';
import { databaseBuffer } from '../database-buffer.js';

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

  const values = {
    certificationCandidateId,
    complementaryCertificationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-subscriptions',
    values,
  });
};

export { buildComplementaryCertificationSubscription };
