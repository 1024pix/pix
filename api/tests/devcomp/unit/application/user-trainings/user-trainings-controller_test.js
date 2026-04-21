import sinon from 'sinon';

import { userTrainingsController } from '../../../../../src/devcomp/application/user-trainings/user-trainings-controller.js';
import { usecases as devcompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
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
      const expectedResult = Symbol('serialized-trainings');
      const userRecommendedTrainings = Symbol('userRecommendedTrainings');
      const meta = Symbol('meta');
      sinon.stub(devcompUsecases, 'findPaginatedUserRecommendedTrainings').resolves({ userRecommendedTrainings, meta });
      const trainingSerializer = { serialize: sinon.stub() };
      trainingSerializer.serialize.returns(expectedResult);

      // when
      const response = await userTrainingsController.findPaginatedUserRecommendedTrainings(request, hFake, {
        devcompUsecases,
        trainingSerializer,
      });

      // then
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledOnce;
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledWithExactly({
        userId: 1,
        locale,
        page,
      });
      expect(trainingSerializer.serialize).to.have.been.calledWithExactly(userRecommendedTrainings, meta);
      expect(response).to.equal(expectedResult);
    });
  });
});
