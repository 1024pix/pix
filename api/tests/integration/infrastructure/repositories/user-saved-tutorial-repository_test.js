import { expect, knex, databaseBuilder } from '../../../test-helper';
import userSavedTutorialRepository from '../../../../lib/infrastructure/repositories/user-saved-tutorial-repository';
import UserSavedTutorial from '../../../../lib/domain/models/UserSavedTutorial';

describe('Integration | Infrastructure | Repository | user-saved-tutorial-repository', function () {
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('user-saved-tutorials').delete();
  });

  describe('#addTutorial', function () {
    const tutorialId = 'tutorialId';

    context('when the skillId is null', function () {
      const skillId = null;

      it('should store the tutorialId in the users list', async function () {
        // when
        await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const userSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userSavedTutorials).to.have.length(1);
      });

      it('should return the created user saved tutorial', async function () {
        // when
        const userSavedTutorial = await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const savedUserSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(userSavedTutorial.id).to.equal(savedUserSavedTutorials[0].id);
        expect(userSavedTutorial.userId).to.equal(savedUserSavedTutorials[0].userId);
        expect(userSavedTutorial.tutorialId).to.equal(savedUserSavedTutorials[0].tutorialId);
        expect(userSavedTutorial.skillId).to.equal(savedUserSavedTutorials[0].skillId);
      });
    });

    context('when the skillId is provided', function () {
      const skillId = 'skillId';

      it('should store the tutorialId in the users list', async function () {
        // when
        await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const userSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userSavedTutorials).to.have.length(1);
      });

      it('should return the created user saved tutorial', async function () {
        // when
        const userSavedTutorial = await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });

        // then
        const savedUserSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
        expect(userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(userSavedTutorial.id).to.equal(savedUserSavedTutorials[0].id);
        expect(userSavedTutorial.userId).to.equal(savedUserSavedTutorials[0].userId);
        expect(userSavedTutorial.tutorialId).to.equal(savedUserSavedTutorials[0].tutorialId);
        expect(userSavedTutorial.skillId).to.equal(savedUserSavedTutorials[0].skillId);
      });
    });

    context('when the tutorialId already exists in the user list', function () {
      context('and the skillId is different', function () {
        it('should not store a new user-saved-tutorial', async function () {
          // given
          const skillIdA = 'skillIdA';
          const skillIdB = 'skillIdB';
          databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId, skillId: skillIdA });
          await databaseBuilder.commit();

          // when
          const userSavedTutorial = await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillIdB });

          // then
          const savedUserSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
          expect(savedUserSavedTutorials).to.have.length(1);
          expect(userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
          expect(userSavedTutorial.id).to.equal(savedUserSavedTutorials[0].id);
          expect(userSavedTutorial.userId).to.equal(savedUserSavedTutorials[0].userId);
          expect(userSavedTutorial.tutorialId).to.equal(savedUserSavedTutorials[0].tutorialId);
          expect(userSavedTutorial.skillId).to.equal(skillIdA);
        });
      });

      context('and the skillId is the same', function () {
        it('should not store a new user-saved-tutorial', async function () {
          // given
          const skillId = 'skillId';
          databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId, skillId });
          await databaseBuilder.commit();

          // when
          const userSavedTutorial = await userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });

          // then
          const savedUserSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });
          expect(savedUserSavedTutorials).to.have.length(1);
          expect(userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
          expect(userSavedTutorial.id).to.equal(savedUserSavedTutorials[0].id);
          expect(userSavedTutorial.userId).to.equal(savedUserSavedTutorials[0].userId);
          expect(userSavedTutorial.tutorialId).to.equal(savedUserSavedTutorials[0].tutorialId);
          expect(userSavedTutorial.skillId).to.equal(savedUserSavedTutorials[0].skillId);
        });
      });
    });
  });

  describe('#find', function () {
    context('when user has saved tutorials', function () {
      it('should return user-saved-tutorials belonging to given user ordered by descending id', async function () {
        // given
        const userSavedTuto1 = databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'recTutorial',
          userId,
          createdAt: new Date('2022-04-29'),
        });
        const userSavedTuto2 = databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'recTutorial2',
          userId,
          createdAt: new Date('2022-05-02'),
        });
        await databaseBuilder.commit();

        // when
        const userSavedTutorials = await userSavedTutorialRepository.find({ userId });

        // then
        expect(userSavedTutorials).to.have.length(2);
        expect(userSavedTutorials[0]).to.be.instanceOf(UserSavedTutorial);
        expect(userSavedTutorials[0]).to.have.property('tutorialId', 'recTutorial2');
        expect(userSavedTutorials[0]).to.have.property('userId', userId);
        expect(userSavedTutorials[0].createdAt).to.deep.equal(userSavedTuto2.createdAt);
        expect(userSavedTutorials[0].skillId).to.equal(null);
        expect(userSavedTutorials[0].id).to.equal(userSavedTuto2.id);
        expect(userSavedTutorials[1].id).to.equal(userSavedTuto1.id);
        expect(userSavedTutorials[1].createdAt).to.deep.equal(userSavedTuto1.createdAt);
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        const userSavedTutorials = await userSavedTutorialRepository.find({ userId });

        // then
        expect(userSavedTutorials).to.deep.equal([]);
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
      await userSavedTutorialRepository.removeFromUser({ userId, tutorialId });
      const userSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });

      // then
      expect(userSavedTutorials).to.have.length(0);
    });

    context('when the tutorialId does not exist in the user list', function () {
      it('should do nothing', async function () {
        // when
        await userSavedTutorialRepository.removeFromUser({ userId, tutorialId });
        const userSavedTutorials = await knex('user-saved-tutorials').where({ userId, tutorialId });

        // then
        expect(userSavedTutorials).to.have.length(0);
      });
    });
  });
});
