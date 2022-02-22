const { expect, knex, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');
const UserTutorial = require('../../../../lib/domain/models/UserTutorial');
const UserTutorialWithTutorial = require('../../../../lib/domain/models/UserTutorialWithTutorial');
const Tutorial = require('../../../../lib/domain/models/Tutorial');

describe('Integration | Infrastructure | Repository | user-tutorial-repository', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#addTutorial', function () {
    const tutorialId = 'tutorialId';

    it('should store the tutorialId in the users list', async function () {
      // when
      await userTutorialRepository.addTutorial({ userId, tutorialId });

      // then
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });
      expect(userTutorials).to.have.length(1);
    });

    it('should return the created user tutorial', async function () {
      // when
      const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId });

      // then
      const savedUserTutorials = await knex('user_tutorials').where({ userId, tutorialId });
      expect(userTutorial).to.be.instanceOf(UserTutorial);
      expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
      expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
      expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
    });

    context('when the tutorialId already exists in the user list', function () {
      it('should not store the tutorialId', async function () {
        // given
        databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId });

        // then
        const savedUserTutorials = await knex('user_tutorials').where({ userId, tutorialId });
        expect(savedUserTutorials).to.have.length(1);
        expect(userTutorial).to.be.instanceOf(UserTutorial);
        expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
        expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
        expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
      });
    });
  });

  describe('#find', function () {
    context('when user has saved tutorials', function () {
      it('should return user-tutorials belonging to given user', async function () {
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
        expect(userTutorials[0]).to.be.instanceOf(UserTutorial);
        expect(userTutorials[0].tutorialId).to.equal(tutorialId);
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        const userTutorials = await userTutorialRepository.find({ userId });

        // then
        expect(userTutorials).to.deep.equal([]);
      });
    });
  });

  describe('#findWithTutorial', function () {
    context('when user has saved tutorials', function () {
      it('should return user-tutorials belonging to given user', async function () {
        // given
        const tutorialId = 'recTutorial';

        const learningContent = {
          tutorials: [{ id: tutorialId }],
        };
        mockLearningContent(learningContent);

        databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorialsWithTutorials = await userTutorialRepository.findWithTutorial({ userId });

        // then
        expect(userTutorialsWithTutorials).to.have.length(1);
        expect(userTutorialsWithTutorials[0]).to.have.property('userId', userId);
        expect(userTutorialsWithTutorials[0]).to.be.instanceOf(UserTutorialWithTutorial);
        expect(userTutorialsWithTutorials[0].tutorial).to.be.instanceOf(Tutorial);
        expect(userTutorialsWithTutorials[0].tutorial.id).to.equal(tutorialId);
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        const userTutorialsWithTutorials = await userTutorialRepository.findWithTutorial({ userId });

        // then
        expect(userTutorialsWithTutorials).to.deep.equal([]);
      });
    });
  });

  describe('#removeFromUser', function () {
    const tutorialId = 'tutorialId';

    it('should delete the user tutorial', async function () {
      // given
      databaseBuilder.factory.buildUserTutorial({ tutorialId, userId });
      await databaseBuilder.commit();

      // when
      await userTutorialRepository.removeFromUser({ userId, tutorialId });
      const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

      // then
      expect(userTutorials).to.have.length(0);
    });

    context('when the tutorialId does not exist in the user list', function () {
      it('should do nothing', async function () {
        // when
        await userTutorialRepository.removeFromUser({ userId, tutorialId });
        const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });

        // then
        expect(userTutorials).to.have.length(0);
      });
    });
  });
});
