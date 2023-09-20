import { ComplementaryCertificationForTargetProfileAttachment } from '../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationForTargetProfileAttachment.js';

const buildComplementaryCertificationForTargetProfileAttachment = function ({
  id = 1,
  label = 'Complementary certification name',
  hasExternalJury = true,
} = {}) {
  return new ComplementaryCertificationForTargetProfileAttachment({
    id,
    label,
    hasExternalJury,
  });
};

export { buildComplementaryCertificationForTargetProfileAttachment };
