import { Tube } from '../../../../lib/domain/models/Tube.js';
import { BuildSkillCollection as buildSkillCollection } from './build-skill-collection.js';

const buildTube = function ({
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
  thematicId = 'thematic123',
  skillIds = ['skillABC', 'skillDEF'],
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
    thematicId,
    skillIds,
  });
};

export { buildTube };
