const TargetedArea = require('../../../../lib/domain/models/TargetedArea');
const buildTargetedCompetence = require('./build-targeted-competence');

const buildTargetedArea = function buildTargetedArea({
  id = 'someAreaId',
  title = 'someTitle',
  color = 'someColor',
  code = 'someCode',
  frameworkId = 'someFmkId',
  competences = [buildTargetedCompetence()],
} = {}) {
  return new TargetedArea({
    id,
    title,
    color,
    code,
    frameworkId,
    competences,
  });
};

module.exports = buildTargetedArea;
