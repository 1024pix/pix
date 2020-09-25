const TargetedTube = require('../../../../lib/domain/models/TargetedTube');
const buildTargetedSkill = require('./build-targeted-skill');

const buildTargetedTube = function buildTargetedTube({
  id = 'someTubeId',
  practicalTitle = 'somePracticalTitle',
  competenceId = 'someCompetenceId',
  skills = [buildTargetedSkill()],
} = {}) {
  return new TargetedTube({
    id,
    practicalTitle,
    competenceId,
    skills,
  });
};

module.exports = buildTargetedTube;
