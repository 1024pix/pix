const { expect, knex, databaseBuilder } = require('../../../test-helper');
const userTutorialRepository = require(
  '../../../../lib/infrastructure/repositories/user-tutorial-repository');

describe('Integration | Infrastructure | Repository | userTutorialRepository', () => {
  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#addTutorial', () => {
    const tutorialId = 'tutorialId';

    it('should store the tutorialId in the users list', async () => {
      // when
      await userTutorialRepository.addTutorial({ userId, tutorialId });
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

      // then
      expect(userTutorials).to.have.length(1);
    });

    context('when the tutorialId already exists in the user list', function() {
      it('should not store the tutorialId', async () => {
        // given
        databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        await userTutorialRepository.addTutorial({ userId, tutorialId });
        const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

        // then
        expect(userTutorials).to.have.length(1);
      });
    });

  });

});
