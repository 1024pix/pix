const { knex } = require('../tests/test-helper');
const UserSavedTutorial = require('../lib/domain/models/UserSavedTutorial');
const tutorialDatasource = require('../lib/infrastructure/datasources/learning-content/tutorial-datasource');

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
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

module.exports = {
  getAllUserSavedTutorialsWithoutSkillId,
  getAllTutorials,
};
