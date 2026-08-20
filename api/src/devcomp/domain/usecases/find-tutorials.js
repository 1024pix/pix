import _ from 'lodash';

const findTutorials = async function ({
  userId,
  competenceId,
  knowledgeStateRepository,
  skillRepository,
  tubeRepository,
  tutorialRepository,
  locale,
}) {
  const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
  const competenceState = knowledgeState.restrictedToCompetence(competenceId);
  // Seuls les échecs sur des questions réellement posées appellent un tutoriel.
  const invalidatedDirectSkillIds = competenceState
    .invalidatedSkills()
    .filter((skill) => competenceState.isDirect(skill))
    .map(({ id }) => id);

  if (invalidatedDirectSkillIds.length === 0) {
    return [];
  }
  const skills = await skillRepository.findActiveByCompetenceId(competenceId);
  const failedSkills = skills.filter((skill) => invalidatedDirectSkillIds.includes(skill.id));

  const skillsGroupedByTube = _getSkillsGroupedByTube(failedSkills);
  const easiestSkills = _getEasiestSkills(skillsGroupedByTube);

  const tubeNamesForTutorials = _.keys(skillsGroupedByTube);
  const tubes = await tubeRepository.findByNames({ tubeNames: tubeNamesForTutorials, locale });

  const tutorialsWithTubesList = await _getTutorialsWithTubesList(
    easiestSkills,
    tubes,
    tutorialRepository,
    userId,
    locale,
  );
  return _.orderBy(_.flatten(tutorialsWithTubesList), 'tubeName');
};

export { findTutorials };

async function _getTutorialsWithTubesList(easiestSkills, tubes, tutorialRepository, userId, locale) {
  return await Promise.all(
    _.map(easiestSkills, async (skill) => {
      const tube = _.find(tubes, { name: skill.tubeName });
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: skill.tutorialIds,
        userId,
        locale,
      });
      return _.map(tutorials, (tutorial) => {
        tutorial.tubeName = tube.name;
        tutorial.tubePracticalTitle = tube.practicalTitle;
        tutorial.tubePracticalDescription = tube.practicalDescription;
        tutorial.skillId = skill.id;
        return tutorial;
      });
    }),
  );
}

function _getEasiestSkills(skillsGroupByTube) {
  return _.map(skillsGroupByTube, _.head);
}

function _getSkillsGroupedByTube(failedSkills) {
  const sortedSkills = failedSkills.toSorted((a, b) => a.difficulty - b.difficulty);

  const uniqueSkills = Array.from(new Set(sortedSkills));

  return Object.groupBy(uniqueSkills, (uniqueSkill) => uniqueSkill.tubeName);
}
