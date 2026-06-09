import sinon from 'sinon';

import { userTrainingsController } from '../../../../../src/devcomp/application/user-trainings/user-trainings-controller.js';
import { usecases as devcompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | user-trainings-controller', function () {
  describe('#findPaginatedUserRecommendedTrainings', function () {
    it('should call the appropriate use-case', async function () {
      // given
      const page = Symbol('page');
      const locale = 'fr';
      const request = {
        auth: { credentials: { userId: 1 } },
        state: { locale },
        query: { page },
      };
      const userRecommendedTrainings = [{ id: 1, duration: {} }];
      const meta = { page: 1 };
      sinon.stub(devcompUsecases, 'findPaginatedUserRecommendedTrainings').resolves({ userRecommendedTrainings, meta });

      // when
      const response = await userTrainingsController.findPaginatedUserRecommendedTrainings(request, hFake, {
        devcompUsecases,
      });

      // then
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledOnce;
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledWithExactly({
        userId: 1,
        locale,
        page,
      });
      expect(response.data[0]).to.includes({ id: '1', type: 'trainings' });
      expect(response.meta).to.deep.equal({ page: 1 });
    });
  });
});
