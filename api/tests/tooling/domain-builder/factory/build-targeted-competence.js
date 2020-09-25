const TargetedCompetence = require('../../../../lib/domain/models/TargetedCompetence');
const buildTargetedTube = require('./build-targeted-tube');

const buildTargetedCompetence = function buildTargetedCompetence({
  id = 'someCompetenceId',
  name = 'someName',
  index = 'someIndex',
  areaId = 'someAreaId',
  tubes = [buildTargetedTube()],
} = {}) {
  return new TargetedCompetence({
    id,
    name,
    index,
    areaId,
    tubes,
  });
};

module.exports = buildTargetedCompetence;
