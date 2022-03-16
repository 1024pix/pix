const { sinon, expect, domainBuilder } = require('../../../test-helper');
const paginateModule = require('../../../../lib/infrastructure/utils/paginate');
const findRecommendedTutorials = require('../../../../lib/domain/usecases/find-paginated-recommended-tutorials');

describe('Unit | UseCase | find-paginated-recommended-tutorials', function () {
  it('should call tutorial repository with userId and locale', async function () {
    // given
    const userId = 1;
    const page = {
      number: 1,
      size: 2,
    };
    const tutorialRepository = {
      findRecommendedByUserId: sinon.stub().resolves([]),
    };
    const locale = 'fr-fr';

    sinon.stub(paginateModule, 'paginate').returns({ results: [], pagination: {} });

    // when
    await findRecommendedTutorials({
      userId,
      tutorialRepository,
      page,
      locale,
    });

    // then
    expect(tutorialRepository.findRecommendedByUserId).to.have.been.calledWith({ userId, locale });
  });

  describe('when there are no recommended tutorials', function () {
    it('should return empty page data', async function () {
      // Given
      const userId = 1;
      const page = {
        number: 1,
        size: 2,
      };
      const tutorialRepository = {
        findRecommendedByUserId: sinon.stub().resolves([]),
      };

      const expectedPagination = {
        page: 1,
        pageSize: 2,
        rowCount: 0,
        pageCount: 0,
      };

      sinon.stub(paginateModule, 'paginate').returns({ results: [], pagination: expectedPagination });

      // When
      const tutorials = await findRecommendedTutorials({
        userId,
        tutorialRepository,
        page,
      });

      // Then
      expect(tutorials.results).to.have.lengthOf(0);
      expect(tutorials.pagination).to.deep.equal(expectedPagination);
    });
  });

  describe('when there are recommended tutorials for user', function () {
    it('should return a paginated list of tutorials', async function () {
      // Given
      const userId = 1;
      const locale = 'fr-fr';
      const page = {
        number: 1,
        size: 2,
      };

      const expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'tuto1' }),
        domainBuilder.buildTutorial({ id: 'tuto2' }),
        domainBuilder.buildTutorial({ id: 'tuto3' }),
        domainBuilder.buildTutorial({ id: 'tuto4' }),
      ];

      const expectedPagination = {
        page: 1,
        pageSize: 2,
        rowCount: 4,
        pageCount: 2,
      };

      sinon
        .stub(paginateModule, 'paginate')
        .returns({ results: expectedTutorials.slice(0, 2), pagination: expectedPagination });

      const tutorialRepository = {
        findRecommendedByUserId: sinon.stub(),
      };

      tutorialRepository.findRecommendedByUserId.resolves(expectedTutorials);

      // When
      const tutorials = await findRecommendedTutorials({
        userId,
        tutorialRepository,
        page,
        locale,
      });

      //Then
      expect(tutorialRepository.findRecommendedByUserId).to.have.been.calledWith({ userId, locale });
      expect(tutorials.results).to.deep.equal(expectedTutorials.slice(0, 2));
      expect(tutorials.pagination).to.deep.equal(expectedPagination);
      expect(paginateModule.paginate).to.have.been.calledWith(expectedTutorials, page);
    });
  });
});
