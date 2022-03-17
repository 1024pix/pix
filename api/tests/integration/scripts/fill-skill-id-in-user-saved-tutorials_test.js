const { expect, databaseBuilder } = require('../../test-helper');
const { getAllUserSavedTutorialsWithoutSkillId } = require('../../../scripts/fill-skill-id-in-user-saved-tutorials');
const UserSavedTutorial = require('../../../lib/domain/models/UserSavedTutorial');

describe('Integration | Scripts | fill-skillId-in-user-saved-tutorials', function () {
  describe('#getAllUserSavedTutorialsWithoutSkillId', function () {
    it('should retrieve all user saved tutorials without skillId', async function () {
      // given
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto1', skillId: null });
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto2', skillId: 'skill1' });
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'tuto3', skillId: null });
      await databaseBuilder.commit();

      // when
      const userSavedTutorials = await getAllUserSavedTutorialsWithoutSkillId();

      // then
      expect(userSavedTutorials).to.be.lengthOf(2);
      expect(userSavedTutorials[0]).to.be.instanceOf(UserSavedTutorial);
      expect(userSavedTutorials[0].tutorialId).to.equal('tuto1');
      expect(userSavedTutorials[1].tutorialId).to.equal('tuto3');
      expect(userSavedTutorials.every((userSavedTutorials) => userSavedTutorials.skillId === null)).to.be.true;
    });
  });
});
