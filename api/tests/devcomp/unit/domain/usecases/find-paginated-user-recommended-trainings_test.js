import { sinon, expect } from '../../../../test-helper.js';
import { findPaginatedUserRecommendedTrainings } from '../../../../../src/devcomp/domain/usecases/find-paginated-user-recommended-trainings.js';

describe('Unit | UseCase | find-user-recommended-trainings', function () {
  it('should return paginated recommended trainings', async function () {
    // given
    const userId = 123;
    const locale = 'fr-fr';
    const expectedUserRecommendedTrainings = Symbol('user-recommended-trainings');
    const trainingRepository = {
      findPaginatedByUserId: sinon.stub().resolves({
        userRecommendedTrainings: expectedUserRecommendedTrainings,
        pagination: {
          page: 1,
          pageSize: 2,
          rowCount: 1,
          pageCount: 1,
        },
      }),
    };

    const page = {
      number: 1,
      size: 2,
    };

    const expectedMeta = {
      pagination: {
        page: 1,
        pageSize: 2,
        rowCount: 1,
        pageCount: 1,
      },
    };

    // when
    const { userRecommendedTrainings, meta } = await findPaginatedUserRecommendedTrainings({
      userId,
      locale,
      page,
      trainingRepository,
    });

    // then
    expect(trainingRepository.findPaginatedByUserId).to.have.been.calledWithExactly({ userId, locale, page });
    expect(userRecommendedTrainings).to.equal(expectedUserRecommendedTrainings);
    expect(meta).to.deep.equal(expectedMeta);
  });
});
