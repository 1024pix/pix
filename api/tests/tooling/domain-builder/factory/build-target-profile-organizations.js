const TargetProfileOrganizations = require('../../../../lib/domain/models/TargetProfileOrganizations');

module.exports = function buildTargetProfile({ id = 123 } = {}) {
  return new TargetProfileOrganizations({
    id,
  });
};
