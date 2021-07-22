const {
  expect,
  sinon,
  hFake,
  domainBuilder,
} = require('../../../test-helper');

const accountRecoveryController = require('../../../../lib/application/account-recovery/account-recovery-controller');
const usecases = require('../../../../lib/domain/usecases');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const studentInformationForAccountRecoverySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Controller | account-recovery-controller', () => {

  describe('#sendEmailForAccountRecovery', () => {

    it('should call sendEmailForAccountRecovery usecase and return 204', async () => {
      // given
      const newEmail = 'new_email@example.net';
      const studentInformation = {
        ineIna: '123456789BB',
        firstName: 'george',
        lastName: 'de cambridge',
        birthdate: '2013-07-22',
        email: 'new_email@example.net',
      };

      const request = {
        payload: {
          data: {
            attributes: {
              'ine-ina': '123456789BB',
              'first-name': 'george',
              'last-name': 'de cambridge',
              birthdate: '2013-07-22',
              email: newEmail,
            },
          },
        },
      };

      sinon.stub(studentInformationForAccountRecoverySerializer, 'deserialize')
        .withArgs(request.payload)
        .resolves(studentInformation);
      sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

      // when
      const response = await accountRecoveryController.sendEmailForAccountRecovery(request, hFake);

      // then
      expect(usecases.sendEmailForAccountRecovery).calledWith({ studentInformation });
      expect(response.statusCode).to.equal(204);
    });

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

  describe('#updateUserAccount', () => {

    it('should call updateUserAccount usecase and return 204', async () => {
      const user = domainBuilder.buildUser({ id: 1 });
      const temporaryKey = 'validTemporaryKey';
      const email = 'Philippe@example.net';
      const domainTransaction = Symbol();

      const request = {
        params: {
          id: user.id,
        },
        query: {
          'temporary-key': temporaryKey,
        },
        payload: {
          data: {
            attributes: {
              email,
              password: user.password,
            },
          },
        },
      };

      sinon.stub(usecases, 'updateUserAccount').resolves();
      DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };

      // when
      const response = await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(usecases.updateUserAccount).calledWithMatch({
        userId: user.id,
        newEmail: email,
        password: user.password,
        temporaryKey,
        domainTransaction,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

});
