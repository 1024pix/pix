const TargetProfile = require('../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({ skills = [] } = {}) {
  return new TargetProfile({ skills });
};
