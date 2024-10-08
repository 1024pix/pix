import { usecases as libUsecases } from '../../../../../lib/domain/usecases/index.js';
import { userController } from '../../../../../src/evaluation/application/users/user-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | user-controller', function () {
  describe('#rememberUserHasSeenNewDashboardInfo', function () {
    it('should remember user has seen new dashboard info', async function () {
      // given
      const userId = 1;
      const userSerializer = {
        serialize: sinon.stub(),
      };
      sinon.stub(evaluationUsecases, 'rememberUserHasSeenNewDashboardInfo');

      evaluationUsecases.rememberUserHasSeenNewDashboardInfo.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenNewDashboardInfo(
        {
          auth: { credentials: { userId } },
          params: { id: userId },
        },
        hFake,
        { userSerializer },
      );

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenAssessmentInstructions', function () {
    let request;
    let userSerializer;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };
      userSerializer = {
        serialize: sinon.stub(),
      };

      sinon.stub(libUsecases, 'rememberUserHasSeenAssessmentInstructions');
    });

    it('should remember user has seen assessment instructions', async function () {
      // given
      libUsecases.rememberUserHasSeenAssessmentInstructions.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenAssessmentInstructions(request, hFake, {
        userSerializer,
      });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
