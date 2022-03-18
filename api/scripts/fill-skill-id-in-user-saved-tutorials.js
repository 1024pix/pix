const { knex } = require('../tests/test-helper');
const UserSavedTutorial = require('../lib/domain/models/UserSavedTutorial');
const UserSavedTutorialWithTutorial = require('../lib/domain/models/UserSavedTutorialWithTutorial');
const knowledgeElementRepository = require('../lib/infrastructure/repositories/knowledge-element-repository');
const tutorialDatasource = require('../lib/infrastructure/datasources/learning-content/tutorial-datasource');
const skillDatasource = require('../lib/infrastructure/datasources/learning-content/skill-datasource');

async function main() {
  console.log('Starting filling skillId to user saved tutorials');

  const userSavedTutorialsWithoutSkillId = await getAllUserSavedTutorialsWithoutSkillId();
  const tutorials = await getAllTutorials();
  const skills = await getAllSkills();

  const tutorialsWithSkills = associateSkillsToTutorial(skills, tutorials);

  for (const userSavedTutorialWithoutSkillId of userSavedTutorialsWithoutSkillId) {
    const userSavedTutorial = associateTutorialToUserSavedTutorial(
      userSavedTutorialWithoutSkillId,
      tutorialsWithSkills
    );
    if (!userSavedTutorial.tutorial) {
      continue;
    }

    const skillId = await getMostRelevantSkillId(userSavedTutorial);

    if (!skillId) {
      continue;
    }

    await knex('user-saved-tutorials').update({ skillId }).where({ id: userSavedTutorial.id });
  }

  console.log('End filling skillId to user saved tutorials');
}

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

function associateSkillsToTutorial(skills, tutorials) {
  return tutorials.map((tutorial) => {
    const skillIds = skills.filter((skill) => _skillHasTutorialId(skill, tutorial.id)).map((skill) => skill.id);
    return {
      ...tutorial,
      skillIds,
    };
  });
}

function associateTutorialToUserSavedTutorial(userSavedTutorial, tutorials) {
  const tutorial = tutorials.find((tutorial) => tutorial.id === userSavedTutorial.tutorialId);
  return new UserSavedTutorialWithTutorial({ ...userSavedTutorial, tutorial });
}

async function getMostRelevantSkillId(userSavedTutorialWithTutorial) {
  const tutorialSkillIds = userSavedTutorialWithTutorial.tutorial.skillIds;

  if (tutorialSkillIds.length === 1) {
    return tutorialSkillIds[0];
  }

  const invalidatedDirectKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(
    userSavedTutorialWithTutorial.userId
  );

  const mostRelevantKnowledgeElement = invalidatedDirectKnowledgeElements.find((knowledgeElement) =>
    tutorialSkillIds.includes(knowledgeElement.skillId)
  );
  return mostRelevantKnowledgeElement?.skillId;
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = {
  getAllUserSavedTutorialsWithoutSkillId,
  getAllTutorials,
  getAllSkills,
  associateTutorialToUserSavedTutorial,
  associateSkillsToTutorial,
  getMostRelevantSkillId,
  main,
};
