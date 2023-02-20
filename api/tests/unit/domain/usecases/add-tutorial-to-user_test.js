import { sinon, expect, domainBuilder, catchErr } from '../../../test-helper';
import addTutorialToUser from '../../../../lib/domain/usecases/add-tutorial-to-user';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | add-tutorial-to-user', function () {
  let tutorialRepository;
  let userSavedTutorialRepository;
  let skillRepository;
  let userId;

  beforeEach(function () {
    userSavedTutorialRepository = { addTutorial: sinon.spy() };
    userId = 'userId';
  });

  context('when the tutorial exists', function () {
    describe('when skillId is not given', function () {
      it('should call the userSavedTutorialRepository', async function () {
        // Given
        tutorialRepository = { get: domainBuilder.buildTutorial };
        skillRepository = { get: sinon.stub() };
        const skillId = null;
        const tutorialId = 'tutorialId';

        // When
        await addTutorialToUser({
          tutorialRepository,
          userSavedTutorialRepository,
          skillRepository,
          userId,
          tutorialId,
          skillId,
        });

        // Then
        expect(userSavedTutorialRepository.addTutorial).to.have.been.calledWith({ userId, tutorialId, skillId });
        expect(skillRepository.get).not.to.have.been.called;
      });
    });

    describe('when skillId is given', function () {
      describe('when skill exists', function () {
        it('should call the userSavedTutorialRepository', async function () {
          // Given
          tutorialRepository = { get: domainBuilder.buildTutorial };
          skillRepository = { get: sinon.stub().resolves({}) };
          const skillId = 'skillId';
          const tutorialId = 'tutorialId';

          // When
          await addTutorialToUser({
            tutorialRepository,
            userSavedTutorialRepository,
            skillRepository,
            userId,
            tutorialId,
            skillId,
          });

          // Then
          expect(userSavedTutorialRepository.addTutorial).to.have.been.calledWith({ userId, tutorialId, skillId });
          expect(skillRepository.get).to.have.been.calledWith(skillId);
        });
      });

      describe('when skill does not exist', function () {
        it('should throw a Domain error', async function () {
          // Given
          tutorialRepository = { get: domainBuilder.buildTutorial };
          skillRepository = { get: sinon.stub().rejects(new NotFoundError()) };
          const skillId = 'skillIdNotFound';
          const tutorialId = 'tutorialId';

          // When
          const error = await catchErr(addTutorialToUser)({
            tutorialRepository,
            userSavedTutorialRepository,
            skillRepository,
            userId,
            tutorialId,
            skillId,
          });

          // Then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(skillRepository.get).to.have.been.calledWith(skillId);
        });
      });
    });
  });

  context("when the tutorial doesn't exist", function () {
    it('should throw a Domain error', async function () {
      // Given
      tutorialRepository = {
        get: async () => {
          throw new NotFoundError();
        },
      };
      const tutorialId = 'nonExistentTutorialId';

      // When
      const error = await catchErr(addTutorialToUser)({
        tutorialRepository,
        userSavedTutorialRepository,
        userId,
        tutorialId,
      });

      // Then
      expect(userSavedTutorialRepository.addTutorial).to.not.have.been.called;
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
