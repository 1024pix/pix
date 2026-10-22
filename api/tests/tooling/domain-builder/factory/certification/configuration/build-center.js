import { Center } from '../../../../../../src/certification/configuration/domain/models/Center.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';

export const buildCenter = function ({ id = 1, type = CERTIFICATION_CENTER_TYPES.SUP, externalId } = {}) {
  return new Center({
    id,
    type,
    externalId,
  });
};
