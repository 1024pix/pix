import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';

export async function findActiveSkillsForCappedTubes(cappedTubes, dependencies = { skillRepository }) {
  const allSkills = await dependencies.skillRepository.findActiveByTubeIds(
    cappedTubes.map((cappedTube) => cappedTube.id),
  );

  const cappedTubesById = Object.fromEntries(cappedTubes.map((cappedTube) => [cappedTube.id, cappedTube]));
  const skillsCapped = allSkills.filter((skill) => {
    const cappedTube = cappedTubesById[skill.tubeId];
    return skill.difficulty <= parseInt(cappedTube.level);
  });

  return skillsCapped;
}
