import { Tube } from '../../../shared/domain/models/Tube.js';

// Several versions of an acquis share a name; Tube#addSkill kept only the first one, so do we.
const uniqueByName = (skills) =>
  Map.groupBy(skills, (skill) => skill.name)
    .values()
    .map(([firstSkill]) => firstSkill);

const byDifficulty = (skillA, skillB) => skillA.difficulty - skillB.difficulty;

function computeTubesFromSkills(skills) {
  const skillsByTubeName = Map.groupBy(skills, (skill) => skill.tubeNameWithoutPrefix);

  return [...skillsByTubeName].map(
    ([name, tubeSkills]) => new Tube({ name, skills: uniqueByName(tubeSkills).toArray().toSorted(byDifficulty) }),
  );
}

export { computeTubesFromSkills };
