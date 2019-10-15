const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

module.exports = async function getTutorials({
  authenticatedUserId,
  scorecardId,
  knowledgeElementRepository,
  skillRepository,
  tubeRepository,
  tutorialRepository,
}) {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });

  const invalidatedKnowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => knowledgeElement.isInvalidated);
  const failedSkills = await Promise.all(invalidatedKnowledgeElements.map((ke) => skillRepository.findByCompetenceId(ke.competenceId)));

  const skillsArraysGroupedByTubeName = _.groupBy(_(failedSkills).flatten().uniq().value(), 'tubeName');
  const tubeNames = Object.keys(skillsArraysGroupedByTubeName);
  const tubesReferences = await tubeRepository.findByNames(tubeNames);

  const tubesWithOnlyFailedSkills = _.map(tubesReferences, (tube) => {
    const failedSkillsToInject = skillsArraysGroupedByTubeName[tube.name];
    tube.skills = failedSkillsToInject;
    return tube;
  });

  const enhancedTutorialList = await Promise.all(_.map(tubesWithOnlyFailedSkills, async (tube) => {
    const easiestSkill = tube.getEasiestSkill();
    const tutorials = await tutorialRepository.findByRecordIds(easiestSkill.tutorialIds);
    const enhancedTutorials = _.map(tutorials, (tutorial) => {
      tutorial.tubeName = tube.name;
      tutorial.tubePracticalTitle = tube.practicalTitle;
      tutorial.tubePracticalDescription = tube.practicalDescription;
      return tutorial;
    });

    return enhancedTutorials;
  }));

  return _.flatten(enhancedTutorialList);
};
