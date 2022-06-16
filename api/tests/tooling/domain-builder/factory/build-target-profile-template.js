const TargetProfileTemplate = require('../../../../lib/domain/models/TargetProfileTemplate');
const TargetProfileTemplateTube = require('../../../../lib/domain/models/TargetProfileTemplateTube');

module.exports = function buildTargetProfileTemplate({
  id = 123,
  targetProfileIds = [],
  tubes = [new TargetProfileTemplateTube({ id: 'tubeId1', level: 8 })],
} = {}) {
  return new TargetProfileTemplate({
    id,
    targetProfileIds,
    tubes,
  });
};
