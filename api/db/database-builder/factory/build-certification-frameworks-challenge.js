import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.ts';
import { buildChallenge } from './learning-content/index.js';

const buildCertificationFrameworksChallenge = function ({
  id = databaseBuffer.getNextId(),
  discriminant = 2.2,
  difficulty = 3.5,
  challengeId,
  createdAt = new Date('2020-01-01'),
  versionId,
} = {}) {
  challengeId = _.isUndefined(challengeId) ? buildChallenge().id : challengeId;

  const values = {
    id,
    discriminant,
    difficulty,
    challengeId,
    createdAt,
    versionId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-frameworks-challenges',
    values,
  });
};

export { buildCertificationFrameworksChallenge };
