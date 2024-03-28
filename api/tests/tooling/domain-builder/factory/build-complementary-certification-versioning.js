import {
  ComplementaryCertificationBadge,
  ComplementaryCertificationVersioning,
} from '../../../../src/certification/complementary-certification/domain/read-models/ComplementaryCertificationVersioning.js';

export const buildComplementaryCertificationVersioning = function ({
  complementaryCertificationId = 123,
  complementaryCertificationBadges = [],
}) {
  return new ComplementaryCertificationVersioning({
    complementaryCertificationId,
    complementaryCertificationBadges,
  });
};

export const buildComplementaryCertificationBadge = function ({ id = 123, deactivationDate }) {
  return new ComplementaryCertificationBadge({
    id,
    deactivationDate,
  });
};
