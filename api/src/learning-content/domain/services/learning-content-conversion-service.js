import * as skillRepository from '../../../../src/shared/infrastructure/repositories/skill-repository.js';

async function findActiveSkillsForCappedTubes(cappedTubes, dependencies = { skillRepository }) {
  const skills = [];
  for (const cappedTube of cappedTubes) {
    const skillsForTube = await dependencies.skillRepository.findActiveByTubeId(cappedTube.id);
    const skillsCapped = skillsForTube.filter((skill) => skill.difficulty <= parseInt(cappedTube.level));
    skills.push(...skillsCapped);
  }
  return skills;
}

export { findActiveSkillsForCappedTubes };
