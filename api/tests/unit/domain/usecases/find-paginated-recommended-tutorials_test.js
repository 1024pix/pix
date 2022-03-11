const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findRecommendedTutorials = require('../../../../lib/domain/usecases/find-paginated-recommended-tutorials');

describe('Unit | UseCase | find-paginated-recommended-tutorials', function () {
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
    it('should return paginated list of tutorials', async function () {
      // Given
      const userId = 1;
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

      const tutorialRepository = {
        findRecommendedByUserId: sinon.stub(),
      };

      tutorialRepository.findRecommendedByUserId.resolves(expectedTutorials);

      // When
      const tutorials = await findRecommendedTutorials({
        userId,
        tutorialRepository,
        page,
      });

      //Then
      expect(tutorialRepository.findRecommendedByUserId).to.have.been.calledWith(userId);
      expect(tutorials.results).to.deep.equal(expectedTutorials.slice(0, 2));
      expect(tutorials.pagination).to.deep.equal(expectedPagination);
    });
  });
});
