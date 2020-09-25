const TargetedArea = require('../../../../lib/domain/models/TargetedArea');
const buildTargetedCompetence = require('./build-targeted-competence');

const buildTargetedArea = function buildTargetedArea({
  id = 'someAreaId',
  title = 'someTitle',
  competences = [buildTargetedCompetence()],
} = {}) {
  return new TargetedArea({
    id,
    title,
    competences,
  });
};

module.exports = buildTargetedArea;
