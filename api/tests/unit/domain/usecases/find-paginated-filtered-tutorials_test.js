import { sinon, expect } from '../../../test-helper';
import findPaginatedFilteredTutorials from '../../../../lib/domain/usecases/find-paginated-filtered-tutorials';
import Tutorial from '../../../../lib/domain/models/Tutorial';

describe('Unit | UseCase | find-paginated-filtered-tutorials', function () {
  let tutorialRepository;
  let expectedSavedTutorials;
  let expectedRecommendedTutorials;
  let expectedPagination;
  let expectedMeta;

  beforeEach(function () {
    expectedSavedTutorials = Symbol('tutorials');
    expectedPagination = Symbol('pagination');
    expectedMeta = { pagination: expectedPagination };
    tutorialRepository = {
      findPaginatedFilteredRecommendedByUserId: sinon.stub().resolves({
        results: expectedRecommendedTutorials,
        pagination: expectedPagination,
      }),
      findPaginatedFilteredForCurrentUser: sinon.stub().resolves({
        models: expectedSavedTutorials,
        meta: expectedPagination,
      }),
    };
  });

  context('when no type filter is provided', function () {
    it('should return saved tutorials', async function () {
      // given
      const userId = 123;
      const filters = {};
      const locale = Symbol('locale');
      const page = Symbol('page');

      // when
      const result = await findPaginatedFilteredTutorials({ userId, filters, page, locale, tutorialRepository });

      // then
      expect(tutorialRepository.findPaginatedFilteredRecommendedByUserId).to.have.not.been.called;
      expect(tutorialRepository.findPaginatedFilteredForCurrentUser).to.have.been.calledWithExactly({
        userId,
        filters,
        page,
      });
      expect(result).to.deep.equal({ tutorials: expectedSavedTutorials, meta: expectedMeta });
    });
  });

  context('when filter type is "SAVED"', function () {
    it('should return saved tutorials', async function () {
      // given
      const userId = 123;
      const filters = { type: Tutorial.TYPES.SAVED };
      const locale = Symbol('locale');
      const page = Symbol('page');

      // when
      const result = await findPaginatedFilteredTutorials({ userId, filters, page, locale, tutorialRepository });

      // then
      expect(tutorialRepository.findPaginatedFilteredRecommendedByUserId).to.have.not.been.called;
      expect(tutorialRepository.findPaginatedFilteredForCurrentUser).to.have.been.calledWithExactly({
        userId,
        filters,
        page,
      });
      expect(result).to.deep.equal({ tutorials: expectedSavedTutorials, meta: expectedMeta });
    });
  });

  context('when filter type is "RECOMMENDED"', function () {
    it('should return recommended tutorials', async function () {
      // given
      const userId = 123;
      const filters = { type: Tutorial.TYPES.RECOMMENDED };
      const locale = Symbol('locale');
      const page = Symbol('page');

      // when
      const result = await findPaginatedFilteredTutorials({ userId, filters, page, locale, tutorialRepository });

      // then
      expect(tutorialRepository.findPaginatedFilteredForCurrentUser).to.have.not.been.called;
      expect(tutorialRepository.findPaginatedFilteredRecommendedByUserId).to.have.been.calledWithExactly({
        userId,
        filters,
        locale,
        page,
      });
      expect(result).to.deep.equal({ tutorials: expectedRecommendedTutorials, meta: expectedMeta });
    });
  });
});
