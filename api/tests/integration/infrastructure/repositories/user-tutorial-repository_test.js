const { expect, knex, databaseBuilder } = require('../../../test-helper');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');

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

  describe('#find', () => {

    context('when user has saved tutorials', function() {
      it('should return user-tutorials belonging to given user', async () => {
        // given
        const tutorialId = 'recTutorial';
        databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorials = await userTutorialRepository.find({ userId });

        // then
        expect(userTutorials).to.have.length(1);
        expect(userTutorials[0]).to.have.property('tutorialId', tutorialId);
        expect(userTutorials[0]).to.have.property('userId', userId);
      });
    });

    context('when user has not saved tutorial', function() {
      it('should empty array', async () => {
        const userTutorials = await userTutorialRepository.find({ userId });

        // then
        expect(userTutorials).to.deep.equal([]);
      });
    });

  });

  describe('#removeFromUser', () => {
    const tutorialId = 'tutorialId';

    it('should delete the user tutorial', async () => {
      // given
      databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
      await databaseBuilder.commit();

      // when
      await userTutorialRepository.removeFromUser({ userId, tutorialId });
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

      // then
      expect(userTutorials).to.have.length(0);
    });

    context('when the tutorialId does not exist in the user list', function() {
      it('should do nothing', async () => {
        // when
        await userTutorialRepository.removeFromUser({ userId, tutorialId });
        const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

        // then
        expect(userTutorials).to.have.length(0);
      });
    });

  });
});
