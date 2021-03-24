const { expect, knex, databaseBuilder } = require('../../../test-helper');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');

describe('Integration | Infrastructure | Repository | userTutorialRepository', function() {
  let userId;

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#addTutorial', function() {
    const tutorialId = 'tutorialId';

    it('should store the tutorialId in the users list', async function() {
      // when
      await userTutorialRepository.addTutorial({ userId, tutorialId });

      // then
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });
      expect(userTutorials).to.have.length(1);
    });

    it('should return the created user tutorial', async function() {
      // when
      const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId });

      // then
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });
      expect(userTutorial.id).to.deep.equal(userTutorials[0].id);
      expect(userTutorial.userId).to.deep.equal(userTutorials[0].userId);
      expect(userTutorial.tutorialId).to.deep.equal(userTutorials[0].tutorialId);
    });

    context('when the tutorialId already exists in the user list', function() {
      it('should not store the tutorialId', async function() {
        // given
        databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId });

        // then
        const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });
        expect(userTutorials).to.have.length(1);
        expect(userTutorial.id).to.deep.equal(userTutorials[0].id);
        expect(userTutorial.userId).to.deep.equal(userTutorials[0].userId);
        expect(userTutorial.tutorialId).to.deep.equal(userTutorials[0].tutorialId);
      });
    });

  });

  describe('#find', function() {

    context('when user has saved tutorials', function() {
      it('should return user-tutorials belonging to given user', async function() {
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
      it('should empty array', async function() {
        const userTutorials = await userTutorialRepository.find({ userId });

        // then
        expect(userTutorials).to.deep.equal([]);
      });
    });

  });

  describe('#removeFromUser', function() {
    const tutorialId = 'tutorialId';

    it('should delete the user tutorial', async function() {
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
      it('should do nothing', async function() {
        // when
        await userTutorialRepository.removeFromUser({ userId, tutorialId });
        const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

        // then
        expect(userTutorials).to.have.length(0);
      });
    });

  });
});
