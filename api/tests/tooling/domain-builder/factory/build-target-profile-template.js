const TargetProfileTemplate = require('../../../../lib/domain/models/TargetProfileTemplate');

module.exports = function buildTargetProfileTemplate({
  id = 123,
  targetProfileIds = [],
  tubes = [{ tubeId: 'tubeId1', level: 8 }],
} = {}) {
  return new TargetProfileTemplate({
    id,
    targetProfileIds,
    tubes,
  });
};
