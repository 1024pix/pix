const Accreditation = require('../../../../lib/domain/models/Accreditation');

module.exports = function buildComplementaryCertification({ id = 1, name = 'Complementary certification name' } = {}) {
  return new Accreditation({
    id,
    name,
  });
};
