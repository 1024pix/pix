const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const calculateScoringInformationForCompetence =
  require('../lib/domain/services/scoring/scoring-service').calculateScoringInformationForCompetence;
const buildKnowledgeElement = require('../db/database-builder/factory/build-knowledge-element');
const tubeRepository = require('../lib/infrastructure/repositories/tube-repository');
const skillRepository = require('../lib/infrastructure/repositories/skill-repository');
const knowledgeElementRepository = require('../lib/infrastructure/repositories/knowledge-element-repository');
const { cache } = require('../lib/infrastructure/caches/learning-content-cache');

const { disconnect } = require('../db/knex-database-connection');

async function getUserSkillsGroupedByTubeId(elements) {
  const ids = _.map(elements, (current) => current.skillId);
  const skills = [];
  for (const id of ids) {
    const skill = await skillRepository.get(id);
    skills.push(skill);
  }

  // we group them by tube id
  return _.groupBy(skills, 'tubeId');
}

function getHardestSkillByTubeId(skillsGroupedByTubeId) {
  const result = {};
  _.forIn(skillsGroupedByTubeId, (tubeSkills, tubeId) => {
    result[tubeId] = _.maxBy(tubeSkills, 'difficulty');
  });

  return result;
}

async function getTubeByIds(ids) {
  return Promise.all(ids.map(async (tubeId) => tubeRepository.get(tubeId)));
}

async function getUserValidatedKnowledgeElements(userId) {
  const foundKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
  return await foundKnowledgeElements.filter((ke) => {
    return ke.isValidated;
  });
}

function buildKnowledgeElementsFromSkillsInTube(skills) {
  return _.map(skills, (current, index) => {
    const options = {};
    options.skillId = current.id;
    options.source = index === skills.length - 1 ? 'direct' : 'inferred';
    options.competenceId = current.competenceId;
    options.earnedPix = current.pixValue;
    const ke = buildKnowledgeElement(options);
    return ke;
  });
}

async function compareUserScoreWithLatestRelease(userId) {
  const knowledgeElements = await getUserValidatedKnowledgeElements(userId);

  // we get the actual pix score
  const knowledgeElementsByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
    userId,
  });

  // then we get the score for each competence
  const scores = _.map(knowledgeElementsByCompetenceId, function (knowledgeElements) {
    return calculateScoringInformationForCompetence({ knowledgeElements });
  });

  // and we sum it
  const userScore = _.sumBy(scores, 'pixScoreForCompetence');

  // we get the user skills
  const skillsGroupedByTubeId = await getUserSkillsGroupedByTubeId(knowledgeElements);

  // and we keep the hardest skill by tube id
  const hardestSkillByTubeId = getHardestSkillByTubeId(skillsGroupedByTubeId);

  // then we get the tubes
  const tubes = await getTubeByIds(Object.keys(hardestSkillByTubeId));

  // then we loop over the tubes
  const fakeKnowledgeElements = [];

  for (const currentTube of tubes) {
    const hardestSkill = hardestSkillByTubeId[currentTube.id];

    if (!hardestSkill) continue;

    // we find active skills by competence and tube id
    const activeSkills = await skillRepository.findActiveByTubeId(currentTube.id);
    currentTube.skills = activeSkills;

    // and we get the actual ref skills into the tube that are easier or equal the hardest Skill
    const earnedSkills = currentTube.getEasierThan(hardestSkill);

    // then, we rebuild fake knowledgeElements based on those skills and we store it
    fakeKnowledgeElements.push(...buildKnowledgeElementsFromSkillsInTube(earnedSkills));
  }

  const fakeKnowledgeElementsGroupedCompetenceId = _.groupBy(fakeKnowledgeElements, 'competenceId');
  const scoresByCompetenceId = _.map(fakeKnowledgeElementsGroupedCompetenceId, function (current) {
    return calculateScoringInformationForCompetence({ knowledgeElements: current }).pixScoreForCompetence;
  });

  const todayScore = _.sum(scoresByCompetenceId);

  return {
    userId,
    userScore,
    todayScore,
  };
}

async function main(userId) {
  const result = await compareUserScoreWithLatestRelease(userId);
  await cache.quit();
  await disconnect();
  console.log(result);
}

module.exports = {
  compareUserScoreWithLatestRelease,
  getUserValidatedKnowledgeElements,
  getUserSkillsGroupedByTubeId,
  getHardestSkillByTubeId,
  getTubeByIds,
};

main(parseInt(process.argv[2]));
