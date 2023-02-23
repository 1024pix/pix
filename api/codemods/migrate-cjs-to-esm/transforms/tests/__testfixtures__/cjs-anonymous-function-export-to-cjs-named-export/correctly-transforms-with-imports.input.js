const { UserNotAuthorizedToAccessEntityError } = require('../errors.js');
const Scorecard = require('../models/Scorecard.js');
const KnowledgeElement = require('../models/KnowledgeElement.js');
const _ = require('lodash');
module.exports = async function findTutorials({
  authenticatedUserId,
  scorecardId,
  knowledgeElementRepository,
  skillRepository,
  tubeRepository,
  tutorialRepository,
  locale,
}) {
  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });
  const invalidatedDirectKnowledgeElements = _getInvalidatedDirectKnowledgeElements(knowledgeElements);

  if (invalidatedDirectKnowledgeElements.length === 0) {
    return [];
  }
  const skills = await skillRepository.findActiveByCompetenceId(competenceId);
  const failedSkills = _getFailedSkills(skills, invalidatedDirectKnowledgeElements);

  const skillsGroupedByTube = _getSkillsGroupedByTube(failedSkills);
  const easiestSkills = _getEasiestSkills(skillsGroupedByTube);

  const tubeNamesForTutorials = _.keys(skillsGroupedByTube);
  const tubes = await tubeRepository.findByNames({ tubeNames: tubeNamesForTutorials, locale });

  const tutorialsWithTubesList = await _getTutorialsWithTubesList(
    easiestSkills,
    tubes,
    tutorialRepository,
    userId,
    locale
  );
  return _.orderBy(_.flatten(tutorialsWithTubesList), 'tubeName');
};

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
    })
  );
}
