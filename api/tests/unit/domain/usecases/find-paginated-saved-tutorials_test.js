const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findPaginatedSavedTutorials = require('../../../../lib/domain/usecases/find-paginated-saved-tutorials');

describe('Unit | UseCase | find-paginated-saved-tutorials', function () {
  let tutorialEvaluationRepository;
  let tutorialRepository;
  const userId = 'userId';

  context('when there is no tutorial saved by current user', function () {
    beforeEach(function () {
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      tutorialRepository = {
        findPaginatedWithUserTutorialForCurrentUser: sinon.spy(async () => ({
          models: [],
          meta: {
            page: 1,
            pageSize: 10,
            rowCount: 0,
            pageCount: 0,
          },
        })),
      };
    });

    it('should call the tutorialRepository', async function () {
      // given
      const page = {
        number: 1,
        size: 2,
      };

      // When
      await findPaginatedSavedTutorials({ tutorialEvaluationRepository, tutorialRepository, userId, page });

      // Then
      expect(tutorialRepository.findPaginatedWithUserTutorialForCurrentUser).to.have.been.calledWith({ userId, page });
    });

    it('should return an empty array', async function () {
      // given
      const page = {
        number: 1,
        size: 2,
      };

      const expectedPagination = {
        page: 1,
        pageSize: 10,
        rowCount: 0,
        pageCount: 0,
      };

      // When
      const paginatedSavedTutorials = await findPaginatedSavedTutorials({
        tutorialEvaluationRepository,
        tutorialRepository,
        userId,
        page,
      });

      // Then
      expect(paginatedSavedTutorials).to.deep.equal({ results: [], meta: expectedPagination });
    });
  });

  context('when there is one tutorial saved by current user', function () {
    it('should return paginated tutorial with user-tutorials', async function () {
      // Given
      const tutorialWithUserSavedTutorial = domainBuilder.buildTutorialForUser();
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      tutorialRepository = {
        findPaginatedWithUserTutorialForCurrentUser: sinon.spy(async () => ({
          models: [tutorialWithUserSavedTutorial],
          meta: {
            page: 1,
            pageSize: 2,
            rowCount: 1,
            pageCount: 1,
          },
        })),
      };

      const page = {
        number: 1,
        size: 2,
      };

      const expectedPagination = {
        page: 1,
        pageSize: 2,
        rowCount: 1,
        pageCount: 1,
      };

      // When
      const paginatedSavedTutorials = await findPaginatedSavedTutorials({
        tutorialEvaluationRepository,
        tutorialRepository,
        userId,
        page,
      });

      // Then
      expect(paginatedSavedTutorials).to.deep.equal({
        results: [tutorialWithUserSavedTutorial],
        meta: expectedPagination,
      });
    });

    context('when user has evaluated a tutorial', function () {
      it('should return tutorial with user-tutorials', async function () {
        // Given
        const tutorialWithUserSavedTutorial = domainBuilder.buildTutorialForUser();
        const tutorialEvaluation = {
          id: 123,
          userId: tutorialWithUserSavedTutorial.userTutorial.userId,
          tutorialId: tutorialWithUserSavedTutorial.id,
        };
        tutorialEvaluationRepository = { find: sinon.spy(async () => [tutorialEvaluation]) };
        tutorialRepository = {
          findPaginatedWithUserTutorialForCurrentUser: sinon.spy(async () => ({
            models: [tutorialWithUserSavedTutorial],
            meta: {
              page: 1,
              pageSize: 2,
              rowCount: 1,
              pageCount: 1,
            },
          })),
        };

        const page = {
          number: 1,
          size: 2,
        };

        const expectedPagination = {
          page: 1,
          pageSize: 2,
          rowCount: 1,
          pageCount: 1,
        };

        const expectedSavedTutorialWithUserTutorial = {
          ...tutorialWithUserSavedTutorial,
          tutorialEvaluation,
        };
        // When
        const paginatedSavedTutorials = await findPaginatedSavedTutorials({
          tutorialEvaluationRepository,
          tutorialRepository,
          userId,
          page,
        });

        // Then
        expect(paginatedSavedTutorials).to.deep.equal({
          results: [expectedSavedTutorialWithUserTutorial],
          meta: expectedPagination,
        });
      });
    });
  });
});
