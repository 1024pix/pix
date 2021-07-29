const {
  expect,
  sinon,
  hFake,
  domainBuilder,
} = require('../../../test-helper');

const accountRecoveryController = require('../../../../lib/application/account-recovery/account-recovery-controller');
const usecases = require('../../../../lib/domain/usecases');
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

    it('should return serialized account recovery details', async () => {
      // given
      const temporaryKey = 'ABCDEFZEFDD';
      const studentInformation = { id: 1234, email: 'philipe@example.net', firstName: 'philipe' };
      const request = {
        params: { temporaryKey },
      };
      sinon.stub(usecases, 'getAccountRecoveryDetails');
      sinon.stub(studentInformationForAccountRecoverySerializer, 'serializeAccountRecovery');
      usecases.getAccountRecoveryDetails.resolves(studentInformation);

      // when
      await accountRecoveryController.checkAccountRecoveryDemand(request, hFake);

      // then
      expect(usecases.getAccountRecoveryDetails).to.have.been.calledWith({ temporaryKey });
      expect(studentInformationForAccountRecoverySerializer.serializeAccountRecovery).to.have.been.calledWith(studentInformation);
    });
  });

  describe('#updateUserAccount', () => {

    it('should call updateUserAccount usecase and return 204', async () => {
      // given
      const user = domainBuilder.buildUser({ id: 1 });
      const temporaryKey = 'validTemporaryKey';
      const domainTransaction = Symbol();

      const request = {
        params: {
          id: user.id,
        },
        payload: {
          data: {
            attributes: {
              password: user.password,
              'temporary-key': temporaryKey,
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
        password: user.password,
        temporaryKey,
        domainTransaction,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

});
