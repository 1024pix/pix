const { expect, sinon, hFake } = require('../../../test-helper');
const accountRecoveryController = require('../../../../lib/application/account-recovery/account-recovery-controller');
const usecases = require('../../../../lib/domain/usecases');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Controller | account-recovery', function () {
  describe('#sendEmailForAccountRecovery', function () {
    const request = {
      payload: {
        data: {
          attributes: {
            'first-name': 'george',
            'last-name': 'de cambridge',
            'ine-ina': '123456789BB',
            birthdate: '2013-07-22',
            email: 'new_email@example.net',
          },
        },
      },
    };

    it('should call the usecase with the right command', async function () {
      // given
      const expectedCommand = {
        firstName: 'george',
        lastName: 'de cambridge',
        ineIna: '123456789BB',
        birthdate: '2013-07-22',
        email: 'new_email@example.net',
      };
      sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

      // when
      await accountRecoveryController.sendEmailForAccountRecovery(request, hFake);

      // then
      expect(usecases.sendEmailForAccountRecovery).calledWithExactly({ studentInformation: expectedCommand });
    });

    it('should return a response with 204 code', async function () {
      // given
      sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

      // when
      const response = await accountRecoveryController.sendEmailForAccountRecovery(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#checkAccountRecoveryDemand', function () {
    const request = {
      params: { temporaryKey: 'TEMPORARY_KEY' },
    };

    it('should return the serialized student information for recovery', async function () {
      // given
      const studentInformation = { id: 1234, email: 'philipe@example.net', firstName: 'philipe' };
      sinon
        .stub(usecases, 'getAccountRecoveryDetails')
        .withArgs({ temporaryKey: 'TEMPORARY_KEY' })
        .resolves(studentInformation);

      // when
      const response = await accountRecoveryController.checkAccountRecoveryDemand(request);

      // then
      expect(response.data).to.deep.equal({
        type: 'account-recovery-demands',
        id: '1234',
        attributes: {
          'first-name': 'philipe',
          email: 'philipe@example.net',
        },
      });
    });
  });

  describe('#updateUserForAccountRecovery', function () {
    const request = {
      payload: {
        data: {
          attributes: {
            'temporary-key': 'TEMPORARY_KEY',
            password: 'Azerty123',
          },
        },
      },
    };

    it('should call the usecase with the right command', async function () {
      // given
      const domainTransaction = Symbol('a domain transaction');
      const expectedCommand = {
        temporaryKey: 'TEMPORARY_KEY',
        password: 'Azerty123',
        domainTransaction,
      };
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };
      sinon.stub(usecases, 'updateUserForAccountRecovery').resolves();

      // when
      await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(usecases.updateUserForAccountRecovery).calledWithExactly(expectedCommand);
    });

    it('should return a response with 204 code', async function () {
      // given
      sinon.stub(usecases, 'updateUserForAccountRecovery').resolves();
      DomainTransaction.execute = (lambda) => {
        return lambda();
      };

      // when
      const response = await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
