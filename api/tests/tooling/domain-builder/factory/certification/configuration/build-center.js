import { Center } from '../../../../../../src/certification/configuration/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';

export const buildCenter = function ({ id = 1, type = CenterTypes.SUP, externalId } = {}) {
  return new Center({
    id,
    type,
    externalId,
  });
};
