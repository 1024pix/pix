import 'dotenv/config';

import lodash from 'lodash';
const { groupBy } = lodash;
import * as url from 'node:url';

import { knex } from '../db/knex-database-connection.js';
import * as knowledgeElementRepository from '../lib/infrastructure/repositories/knowledge-element-repository.js';
import { UserSavedTutorial } from '../src/devcomp/domain/models/UserSavedTutorial.js';
import { KnowledgeElement } from '../src/shared/domain/models/KnowledgeElement.js';
import { UserSavedTutorialWithTutorial } from '../src/shared/domain/models/UserSavedTutorialWithTutorial.js';
import {
  skillDatasource,
  tutorialDatasource,
} from '../src/shared/infrastructure/datasources/learning-content/index.js';
import { executeScript } from './tooling/tooling.js';

async function getAllUserSavedTutorialsWithoutSkillId() {
  const userSavedTutorials = await knex('user-saved-tutorials').whereNull('skillId');
  return userSavedTutorials.map(_toDomain);
}

function _toDomain(userSavedTutorial) {
  return new UserSavedTutorial({
    id: userSavedTutorial.id,
    tutorialId: userSavedTutorial.tutorialId,
    userId: userSavedTutorial.userId,
    skillId: userSavedTutorial.skillId,
  });
}

async function getAllTutorials() {
  return tutorialDatasource.list();
}

async function getAllSkills() {
  return skillDatasource.list();
}

function _skillHasTutorialId(skill, tutorialId) {
  return skill.tutorialIds.includes(tutorialId);
}

function _skillHasLearningMoreTutorialId(skill, tutorialId) {
  return skill.learningMoreTutorialIds?.includes(tutorialId);
}

function associateSkillsToTutorial(skills, tutorials) {
  return tutorials.map((tutorial) => {
    const skillIds = skills.filter((skill) => _skillHasTutorialId(skill, tutorial.id)).map((skill) => skill.id);
    const referenceBySkillsIdsForLearningMore = skills
      .filter((skill) => _skillHasLearningMoreTutorialId(skill, tutorial.id))
      .map((skill) => skill.id);
    return {
      ...tutorial,
      skillIds,
      referenceBySkillsIdsForLearningMore,
    };
  });
}

async function fillSkillIdForGivenUserSavedTutorials(
  userSavedTutorialsWithoutSkillId,
  userId,
  tutorialsWithSkills,
  knowledgeElements,
) {
  for (const userSavedTutorialWithoutSkillId of userSavedTutorialsWithoutSkillId) {
    const userSavedTutorial = associateTutorialToUserSavedTutorial(
      userSavedTutorialWithoutSkillId,
      tutorialsWithSkills,
    );
    if (!userSavedTutorial.tutorial) {
      console.log(`Outdated tutorial ${userSavedTutorialWithoutSkillId.tutorialId}`);
      continue;
    }

    const skillId = getMostRelevantSkillId(userSavedTutorial, knowledgeElements);

    if (!skillId) {
      console.log(`Not found skillId for this user-saved-tutorials id : ${userSavedTutorial.id}`);
      continue;
    }

    await knex('user-saved-tutorials').update({ skillId }).where({ id: userSavedTutorial.id });
  }
}

function associateTutorialToUserSavedTutorial(userSavedTutorial, tutorials) {
  const tutorial = tutorials.find((tutorial) => tutorial.id === userSavedTutorial.tutorialId);
  return new UserSavedTutorialWithTutorial({ ...userSavedTutorial, tutorial });
}

function getMostRelevantSkillId(userSavedTutorialWithTutorial, knowledgeElements) {
  const tutorial = userSavedTutorialWithTutorial.tutorial;
  const tutorialSkillIds = tutorial.skillIds;
  const tutorialReferenceBySkillsIdsForLearningMore = tutorial.referenceBySkillsIdsForLearningMore;

  if (tutorialSkillIds.length === 0 && tutorialReferenceBySkillsIdsForLearningMore.length === 0) {
    return undefined;
  }

  const directKnowledgeElements = knowledgeElements.filter(_isDirect);

  for (const { skillId } of directKnowledgeElements) {
    if (_hasSkillId(tutorial, skillId)) {
      return skillId;
    }
  }

  if (tutorialSkillIds.length > 0) {
    return tutorialSkillIds[0];
  }

  if (tutorialReferenceBySkillsIdsForLearningMore.length > 0) {
    return tutorialReferenceBySkillsIdsForLearningMore[0];
  }

  return undefined;
}

function _isDirect({ source }) {
  return source === KnowledgeElement.SourceType.DIRECT;
}

function _hasSkillId(tutorial, skillId) {
  const tutorialSkillIds = tutorial.skillIds;
  const tutorialReferenceBySkillsIdsForLearningMore = tutorial.referenceBySkillsIdsForLearningMore;
  return tutorialSkillIds.includes(skillId) || tutorialReferenceBySkillsIdsForLearningMore.includes(skillId);
}

async function main() {
  console.log('Starting filling skillId to user saved tutorials');

  const userSavedTutorialsWithoutSkillId = await getAllUserSavedTutorialsWithoutSkillId();
  const tutorials = await getAllTutorials();
  const skills = await getAllSkills();

  const tutorialsWithSkills = associateSkillsToTutorial(skills, tutorials);

  const userSavedTutorialsWithoutSkillIdGroupedByUserId = groupBy(userSavedTutorialsWithoutSkillId, 'userId');

  const userIds = Object.keys(userSavedTutorialsWithoutSkillIdGroupedByUserId);
  const numberOfUsers = userIds.length;

  for (const userId of userIds) {
    console.log(`User ${userIds.findIndex((id) => id === userId) + 1} of ${numberOfUsers}`);

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
    await fillSkillIdForGivenUserSavedTutorials(
      userSavedTutorialsWithoutSkillIdGroupedByUserId[userId],
      userId,
      tutorialsWithSkills,
      knowledgeElements,
    );
  }

  console.log('End filling skillId to user saved tutorials');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();

export {
  associateSkillsToTutorial,
  associateTutorialToUserSavedTutorial,
  getAllSkills,
  getAllTutorials,
  getAllUserSavedTutorialsWithoutSkillId,
  getMostRelevantSkillId,
  main,
};
