import { userController } from '../../../../../src/evaluation/application/users/user-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | user-controller', function () {
  describe('#rememberUserHasSeenLevelSevenInfo', function () {
    it('should remember user has seen level seven info', async function () {
      // given
      const userId = 1;
      const userInformation = Symbol('userInformation');
      const userInformationSerialized = Symbol('userInformationSerialized');
      const userSerializer = {
        serialize: sinon.stub(),
      };

      sinon.stub(evaluationUsecases, 'rememberUserHasSeenLevelSevenInfo');
      evaluationUsecases.rememberUserHasSeenLevelSevenInfo.withArgs({ userId }).resolves(userInformation);
      userSerializer.serialize.withArgs(userInformation).returns(userInformationSerialized);

      // when
      const response = await userController.rememberUserHasSeenLevelSevenInfo(
        {
          auth: { credentials: { userId } },
          params: { id: userId },
        },
        hFake,
        { userSerializer },
      );

      // then
      expect(response).to.be.equal(userInformationSerialized);
    });
  });

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
});
