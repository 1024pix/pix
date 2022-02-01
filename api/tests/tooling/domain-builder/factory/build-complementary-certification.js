const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

module.exports = function buildComplementaryCertification({ id = 1, name = 'Complementary certification name' } = {}) {
  return new ComplementaryCertification({
    id,
    name,
  });
};
