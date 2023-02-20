import _ from 'lodash';
import buildCertificationCandidate from './build-certification-candidate';
import buildComplementaryCertification from './build-complementary-certification';
import databaseBuffer from '../database-buffer';

export default function buildComplementaryCertificationSubscription({
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
}
