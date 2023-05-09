import _ from 'lodash';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';
import { databaseBuffer } from '../database-buffer.js';

const buildComplementaryCertificationHabilitation = function ({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  complementaryCertificationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  certificationCenterId = _.isNull(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;

  const values = {
    id,
    certificationCenterId,
    complementaryCertificationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-habilitations',
    values,
  });
};

export { buildComplementaryCertificationHabilitation };
