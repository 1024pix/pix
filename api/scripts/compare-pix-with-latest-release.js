import 'dotenv/config';

import * as url from 'node:url';

import _ from 'lodash';

import { buildKnowledgeElement } from '../db/database-builder/factory/build-knowledge-element.js';
import * as knowledgeElementRepository from '../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as tubeRepository from '../lib/infrastructure/repositories/tube-repository.js';
import { calculateScoringInformationForCompetence } from '../src/evaluation/domain/services/scoring/scoring-service.js';
import * as skillRepository from '../src/shared/infrastructure/repositories/skill-repository.js';
import { executeScript } from './tooling/tooling.js';

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
  console.log(result);
}

export {
  compareUserScoreWithLatestRelease,
  getHardestSkillByTubeId,
  getTubeByIds,
  getUserSkillsGroupedByTubeId,
  getUserValidatedKnowledgeElements,
};

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
async () => {
  if (isLaunchedFromCommandLine) {
    const mainWithArgs = main.bind(this, parseInt(process.argv[2]));
    await executeScript({ processArgvs: process.argv, scriptFn: mainWithArgs });
  }
};
