const ComplementaryCertificationForSupervising = require('../../../../lib/domain/models/ComplementaryCertificationForSupervising');

module.exports = function buildComplementaryCertificationForSupervising({
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  certificationExtraTime = 0,
} = {}) {
  return new ComplementaryCertificationForSupervising({
    label,
    key,
    certificationExtraTime,
  });
};
