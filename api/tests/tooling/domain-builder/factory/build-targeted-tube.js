const TargetedTube = require('../../../../lib/domain/models/TargetedTube');
const buildTargetedSkill = require('./build-targeted-skill');

const buildTargetedTube = function buildTargetedTube({
  id = 'someTubeId',
  practicalTitle = 'somePracticalTitle',
  practicalDescription,
  description = 'someDescription',
  level,
  competenceId = 'someCompetenceId',
  skills = [buildTargetedSkill()],
  challenges = [],
} = {}) {
  return new TargetedTube({
    id,
    practicalTitle,
    practicalDescription,
    description,
    level,
    competenceId,
    skills,
    challenges,
  });
};

module.exports = buildTargetedTube;
