const {
  expect,
  sinon,
  hFake,
  domainBuilder,
} = require('../../../test-helper');

const accountRecoveryController = require('../../../../lib/application/account-recovery/account-recovery-controller');
const usecases = require('../../../../lib/domain/usecases');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Controller | account-recovery-controller', () => {

  describe('#sendEmailForAccountRecovery', () => {

    it('should call sendEmailForAccountRecovery usecase and return 204', async () => {
      // given
      const userId = domainBuilder.buildUser({ id: 1 }).id;
      const newEmail = 'new_email@example.net';

      const request = {
        payload: {
          data: {
            attributes: {
              'user-id': userId,
              email: newEmail,
            },
          },
        },
      };

      sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

      // when
      const response = await accountRecoveryController.sendEmailForAccountRecovery(request, hFake);

      // then
      expect(usecases.sendEmailForAccountRecovery).calledWith({ userId, email: newEmail });
      expect(response.statusCode).to.equal(204);
    });

    describe('#checkAccountRecoveryDemand', () => {

      it('should return serialized user', async () => {
        // given
        const temporaryKey = 'ABCDEFZEFDD';
        const request = {
          params: { temporaryKey },
        };
        sinon.stub(usecases, 'getUserByAccountRecoveryDemand');
        sinon.stub(userSerializer, 'serialize');
        usecases.getUserByAccountRecoveryDemand.resolves({ userId: 1234 });

        // when
        await accountRecoveryController.checkAccountRecoveryDemand(request, hFake);

        // then
        expect(usecases.getUserByAccountRecoveryDemand).to.have.been.calledWith({ temporaryKey });
        expect(userSerializer.serialize).to.have.been.calledWith({ userId: 1234 });
      });
    });

  });

});
