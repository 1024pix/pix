const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const Skill = require('../models/Skill');
const Tube = require('../models/Tube');
const _ = require('lodash');

module.exports = async function getTutorials({ authenticatedUserId, scorecardId, knowledgeElementRepository, skillRepository}) {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });

  const invalidatedKnowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => knowledgeElement.isInvalidated);
  const failedSkills = await Promise.all(invalidatedKnowledgeElements.map((ke) => skillRepository.findByCompetenceId(ke.competenceId)));

  const skillsArraysGroupedByTubeName = _.groupBy(failedSkills, (skill) => skill.tubeName);
  const tubes = _.map(skillsArraysGroupedByTubeName, (array) => new Tube({ skills: array }));
  const easiestSkillByTube = _.map(tubes, (tube) => tube.getEasiestSkill());

  return easiestSkillByTube;
};
