const TargetedCompetence = require('../../../../lib/domain/models/TargetedCompetence');
const buildTargetedTube = require('./build-targeted-tube');

const buildTargetedCompetence = function buildTargetedCompetence({
  id = 'someCompetenceId',
  name = 'someName',
  index = 'someIndex',
  origin = 'Pix',
  areaId = 'someAreaId',
  tubes = [buildTargetedTube()],
  thematics = [],
} = {}) {
  return new TargetedCompetence({
    id,
    name,
    index,
    origin,
    areaId,
    tubes,
    thematics,
  });
};

module.exports = buildTargetedCompetence;
