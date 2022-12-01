const Tube = require('../../../../lib/domain/models/Tube');
const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildTube({
  id = 'recTube123',
  name = '@tubeName',
  title = 'titre',
  description = 'description',
  practicalTitle = 'titre pratique',
  practicalDescription = 'description pratique',
  isMobileCompliant = false,
  isTabletCompliant = false,
  skills = buildSkillCollection(),
  competenceId = 'recCOMP123',
} = {}) {
  return new Tube({
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
    isMobileCompliant,
    isTabletCompliant,
    skills,
    competenceId,
  });
};
