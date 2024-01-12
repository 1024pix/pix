import { Center } from '../../../../../../src/certification/session/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/session/domain/models/CenterTypes.js';

const buildCenter = function ({ id = 1, type = CenterTypes.SUP, habilitations } = {}) {
  return new Center({
    id,
    type,
    habilitations,
  });
};

export { buildCenter };
