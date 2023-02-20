import UserCompetence from '../../../../lib/domain/models/UserCompetence';

export default function buildUserCompetence({
  id = 'recUserComp',
  index = '1.1',
  name = 'name',
  areaId = 'recArea',
  pixScore = 42,
  estimatedLevel = 1,
  skills = [],
} = {}) {
  return new UserCompetence({
    id,
    index,
    name,
    areaId,
    pixScore,
    estimatedLevel,
    skills,
  });
}
