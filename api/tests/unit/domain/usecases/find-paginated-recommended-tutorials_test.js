const { sinon, expect } = require('../../../test-helper');
const findRecommendedTutorials = require('../../../../lib/domain/usecases/find-paginated-recommended-tutorials');

describe('Unit | UseCase | find-paginated-recommended-tutorials', function () {
  it('should call tutorial repository with userId, page and locale', async function () {
    // given
    const userId = 1;
    const page = {
      number: 1,
      size: 2,
    };
    const tutorialRepository = {
      findPaginatedRecommendedByUserId: sinon.stub().resolves([]),
    };
    const locale = 'fr-fr';

    // when
    await findRecommendedTutorials({
      userId,
      tutorialRepository,
      page,
      locale,
    });

    // then
    expect(tutorialRepository.findPaginatedRecommendedByUserId).to.have.been.calledWith({ userId, page, locale });
  });
});
