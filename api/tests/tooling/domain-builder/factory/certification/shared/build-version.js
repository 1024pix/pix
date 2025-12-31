import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { Version } from '../../../../../../src/certification/shared/domain/models/Version.js';
import { buildFlashAlgorithmConfiguration } from '../../build-flash-algorithm-configuration.js';

export const buildVersion = ({ id = 1, scope = SCOPES.CORE, challengesConfiguration } = {}) => {
  return new Version({
    id,
    scope,
    challengesConfiguration: buildFlashAlgorithmConfiguration(challengesConfiguration),
  });
};
