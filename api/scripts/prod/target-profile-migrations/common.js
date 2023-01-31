const _ = require('lodash');

let allSkills;
let allTubes;
async function _cacheLearningContentData() {
  const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');
  allSkills = await skillRepository.list();
  const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
  allTubes = await tubeRepository.list();
}
let cached = false;
module.exports = {
  async autoMigrateTargetProfile(id, trx) {
    if (!cached) await _cacheLearningContentData();
    cached = true;
    const skillIds = await trx('target-profiles_skills').pluck('skillId').where({ targetProfileId: id });
    if (skillIds.length === 0) throw new Error("Le profil cible n'a pas d'acquis.");
    const skills = skillIds.map((skillId) => {
      const foundSkill = allSkills.find((skill) => skill.id === skillId);
      if (!foundSkill) throw new Error(`L'acquis "${skillId}" n'existe pas dans le référentiel.`);
      if (!foundSkill.tubeId) throw new Error(`L'acquis "${skillId}" n'appartient à aucun sujet.`);
      const tubeExists = Boolean(allTubes.find((tube) => tube.id === foundSkill.tubeId));
      if (!tubeExists) throw new Error(`Le sujet "${foundSkill.tubeId}" n'existe pas dans le référentiel.`);
      return foundSkill;
    });
    const skillsGroupedByTubeId = _.groupBy(skills, 'tubeId');
    const tubes = [];
    for (const [tubeId, skills] of Object.entries(skillsGroupedByTubeId)) {
      const skillWithHighestDifficulty = _.maxBy(skills, 'difficulty');
      tubes.push({
        tubeId,
        level: skillWithHighestDifficulty.difficulty,
      });
    }
    const completeTubes = tubes.map((tube) => {
      return { ...tube, targetProfileId: id };
    });
    await trx('target-profiles').update({ migration_status: 'AUTO' }).where({ id });
    await trx.batchInsert('target-profile_tubes', completeTubes);
  },
};
