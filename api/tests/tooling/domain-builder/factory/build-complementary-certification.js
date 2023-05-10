const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

module.exports = function buildComplementaryCertification({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  sessionExtraTime = 0,
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
    sessionExtraTime,
  });
};
