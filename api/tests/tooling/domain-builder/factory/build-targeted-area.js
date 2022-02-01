const TargetedArea = require('../../../../lib/domain/models/TargetedArea');
const buildTargetedCompetence = require('./build-targeted-competence');

const buildTargetedArea = function buildTargetedArea({
  id = 'someAreaId',
  title = 'someTitle',
  color = 'someColor',
  competences = [buildTargetedCompetence()],
} = {}) {
  return new TargetedArea({
    id,
    title,
    color,
    competences,
  });
};

module.exports = buildTargetedArea;
