import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';
import { buildChallenge } from './learning-content/build-challenge.js';

const buildCertificationFrameworksChallenge = function ({
  id = databaseBuffer.getNextId(),
  alpha = 2.2,
  delta = 3.5,
  complementaryCertificationId,
  challengeId,
  version = 'xxx-yyy-zzz',
} = {}) {
  complementaryCertificationId = _.isUndefined(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;

  challengeId = _.isUndefined(challengeId) ? buildChallenge().id : challengeId;

  const values = {
    id,
    alpha,
    delta,
    complementaryCertificationId,
    challengeId,
    version,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-frameworks-challenges',
    values,
  });
};

export { buildCertificationFrameworksChallenge };
