import { Center } from '../../../../src/certification/enrolment/domain/models/Center.js';
import { CenterTypes } from '../../../../src/certification/enrolment/domain/models/CenterTypes.js';

const buildCenter = function ({
  id = 1,
  name,
  type = CenterTypes.SUP,
  externalId = 'EX123',
  habilitations,
  features,
  isV3Pilot,
} = {}) {
  return new Center({
    id,
    name,
    type,
    externalId,
    habilitations,
    features,
    isV3Pilot,
  });
};

export { buildCenter };
