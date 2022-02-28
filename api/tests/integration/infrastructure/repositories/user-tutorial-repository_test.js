const { expect, knex, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');
const UserSavedTutorial = require('../../../../lib/domain/models/UserSavedTutorial');
const UserTutorialWithTutorial = require('../../../../lib/domain/models/UserSavedTutorialWithTutorial');
const Tutorial = require('../../../../lib/domain/models/Tutorial');

describe('Integration | Infrastructure | Repository | user-tutorial-repository', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#addTutorial', function () {
    const tutorialId = 'tutorialId';

    context('when the skillId is null', () => {
      const skillId = null;

      it('should store the tutorialId in the users list', async function () {
        // when
        await userTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const userTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userTutorials).to.have.length(1);
      });

      it('should return the created user saved tutorial', async function () {
        // when
        const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const savedUserTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
        expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
        expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
        expect(userTutorial.skillId).to.equal(savedUserTutorials[0].skillId);
      });
    });

    context('when the skillId is provided', () => {
      const skillId = 'skillId';

      it('should store the tutorialId in the users list', async function () {
        // when
        await userTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const userTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userTutorials).to.have.length(1);
      });

      it('should return the created user saved tutorial', async function () {
        // when
        const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const savedUserTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
        expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
        expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
        expect(userTutorial.skillId).to.equal(savedUserTutorials[0].skillId);
      });
    });

    context('when the tutorialId already exists in the user list', function () {
      context('and the skillId is different', () => {
        it('should not store a new user-saved-tutorial', async function () {
          // given
          const skillIdA = 'skillIdA';
          const skillIdB = 'skillIdB';
          databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId, skillId: skillIdA });
          await databaseBuilder.commit();

          // when
          const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId, skillIdB });

          // then
          const savedUserTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
          expect(savedUserTutorials).to.have.length(1);
          expect(userTutorial).to.be.instanceOf(UserSavedTutorial);
          expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
          expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
          expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
          expect(userTutorial.skillId).to.equal(skillIdA);
        });
      });

      context('and the skillId is the same', () => {
        it('should not store a new user-saved-tutorial', async function () {
          // given
          const skillId = 'skillId';
          databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId, skillId });
          await databaseBuilder.commit();

          // when
          const userTutorial = await userTutorialRepository.addTutorial({ userId, tutorialId, skillId });

          // then
          const savedUserTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
          expect(savedUserTutorials).to.have.length(1);
          expect(userTutorial).to.be.instanceOf(UserSavedTutorial);
          expect(userTutorial.id).to.equal(savedUserTutorials[0].id);
          expect(userTutorial.userId).to.equal(savedUserTutorials[0].userId);
          expect(userTutorial.tutorialId).to.equal(savedUserTutorials[0].tutorialId);
          expect(userTutorial.skillId).to.equal(savedUserTutorials[0].skillId);
        });
      });
    });
  });

  describe('#find', function () {
    context('when user has saved tutorials', function () {
      it('should return user-saved-tutorials belonging to given user', async function () {
        // given
        const tutorialId = 'recTutorial';
        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorials = await userTutorialRepository.find({ userId });

        // then
        expect(userTutorials).to.have.length(1);
        expect(userTutorials[0]).to.have.property('tutorialId', tutorialId);
        expect(userTutorials[0]).to.have.property('userId', userId);
        expect(userTutorials[0]).to.be.instanceOf(UserSavedTutorial);
        expect(userTutorials[0].tutorialId).to.equal(tutorialId);
        expect(userTutorials[0].skillId).to.equal(null);
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
      it('should return user-saved-tutorials belonging to given user', async function () {
        // given
        const tutorialId = 'recTutorial';

        const learningContent = {
          tutorials: [{ id: tutorialId }],
        };
        mockLearningContent(learningContent);

        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const userTutorialsWithTutorials = await userTutorialRepository.findWithTutorial({ userId });

        // then
        expect(userTutorialsWithTutorials).to.have.length(1);
        expect(userTutorialsWithTutorials[0]).to.have.property('userId', userId);
        expect(userTutorialsWithTutorials[0]).to.be.instanceOf(UserTutorialWithTutorial);
        expect(userTutorialsWithTutorials[0].tutorial).to.be.instanceOf(Tutorial);
        expect(userTutorialsWithTutorials[0].tutorial.id).to.equal(tutorialId);
        expect(userTutorialsWithTutorials[0].skillId).to.equal(null);
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });

        const userTutorialsWithTutorials = await userTutorialRepository.findWithTutorial({ userId });

        // then
        expect(userTutorialsWithTutorials).to.deep.equal([]);
      });
    });

    context('when user has saved a tutorial not available anymore', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });
        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'recTutorial', userId });
        await databaseBuilder.commit();

        const userTutorialsWithTutorials = await userTutorialRepository.findWithTutorial({ userId });

        // then
        expect(userTutorialsWithTutorials).to.deep.equal([]);
      });
    });
  });

  describe('#removeFromUser', function () {
    const tutorialId = 'tutorialId';

    it('should delete the user saved tutorial', async function () {
      // given
      databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId });
      await databaseBuilder.commit();

      // when
      await userTutorialRepository.removeFromUser({ userId, tutorialId });
      const userTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });

      // then
      expect(userTutorials).to.have.length(0);
    });

    context('when the tutorialId does not exist in the user list', function () {
      it('should do nothing', async function () {
        // when
        await userTutorialRepository.removeFromUser({ userId, tutorialId });
        const userTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });

        // then
        expect(userTutorials).to.have.length(0);
      });
    });
  });
});
