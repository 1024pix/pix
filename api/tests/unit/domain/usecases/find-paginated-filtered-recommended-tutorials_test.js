const { sinon, expect } = require('../../../test-helper');
const findPaginatedFilteredRecommendedTutorials = require('../../../../lib/domain/usecases/find-paginated-filtered-recommended-tutorials');

describe('Unit | UseCase | find-paginated-filtered-recommended-tutorials', function () {
  it('should call tutorial repository with userId, page and locale', async function () {
    // given
    const userId = 1;
    const filters = {
      competences: ['competence1'],
    };
    const page = {
      number: 1,
      size: 2,
    };
    const tutorialRepository = {
      findPaginatedFilteredRecommendedByUserId: sinon.stub().resolves([]),
    };
    const locale = 'fr-fr';

    // when
    await findPaginatedFilteredRecommendedTutorials({
      userId,
      filters,
      page,
      locale,
      tutorialRepository,
    });

    // then
    expect(tutorialRepository.findPaginatedFilteredRecommendedByUserId).to.have.been.calledWith({
      userId,
      filters,
      page,
      locale,
    });
  });
});
