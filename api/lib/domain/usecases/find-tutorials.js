const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

module.exports = async function findTutorials({
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

  if (invalidatedKnowledgeElements.length === 0) {
    return [];
  }
  const skills = await skillRepository.findByCompetenceId(competenceId);
  const failedSkills = _.filter(skills, (skill) => _.includes(_.map(invalidatedKnowledgeElements, 'skillId'), skill.id));

  const skillsGroupByTube = _.groupBy(_(_.orderBy(failedSkills, 'difficulty')).uniq().value(), 'tubeNameWithAt');
  const easiestSkills = _.map(skillsGroupByTube, (skills) => skills[0]);

  const tubeNamesForTutos = _.keys(skillsGroupByTube);
  const tubes = await tubeRepository.findByNames(tubeNamesForTutos);

  const tutorialWithTubesList = await Promise.all(_.map(easiestSkills, async (skill) => {
    const tube = _.find(tubes, { name: skill.tubeNameWithAt });
    const tutorials = await tutorialRepository.findByRecordIds(skill.tutorialIds);
    const enhancedTutorials = _.map(tutorials, (tutorial) => {
      tutorial.tubeName = tube.name;
      tutorial.tubePracticalTitle = tube.practicalTitle;
      tutorial.tubePracticalDescription = tube.practicalDescription;
      return tutorial;

    });
    return enhancedTutorials;

  }));
  return _.orderBy(_.flatten(tutorialWithTubesList), 'tubeName');
};
