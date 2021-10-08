const Accreditation = require('../../../../lib/domain/models/Accreditation');

module.exports = function buildAccreditation({ id = 1, name = 'Accreditation name' } = {}) {
  return new Accreditation({
    id,
    name,
  });
};
