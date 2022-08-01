const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

module.exports = function buildComplementaryCertification({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
};
