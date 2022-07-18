const TargetedThematic = require('../../../../lib/domain/models/TargetedThematic');
const buildTargetedTube = require('./build-targeted-tube');

module.exports = function buildTargetedThematic({
  id = 'someThematicId',
  name = 'someName',
  index = 'someIndex',
  tubes = [buildTargetedTube()],
} = {}) {
  return new TargetedThematic({
    id,
    name,
    index,
    tubes,
  });
};
