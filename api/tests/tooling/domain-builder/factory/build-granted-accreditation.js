const GrantedAccreditation = require('../../../../lib/domain/models/GrantedAccreditation');

module.exports = function buildGrantedAccreditation({
  id = 123,
  accreditationId = 456,
  certificationCenterId = 789,
} = {}) {
  return new GrantedAccreditation({
    id,
    accreditationId,
    certificationCenterId,
  });
};
