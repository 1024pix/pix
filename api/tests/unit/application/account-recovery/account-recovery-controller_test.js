import { expect, sinon, hFake, domainBuilder } from '../../../test-helper.js';
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import { accountRecoveryController } from '#lib/application/account-recovery/account-recovery-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Unit | Controller | account-recovery-controller', function () {
  describe('#sendEmailForAccountRecovery', function () {
    it('should call sendEmailForAccountRecovery usecase and return 204', async function () {
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

      sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

      const studentInformationForAccountRecoverySerializerStub = {
        deserialize: sinon.stub(),
      };

      studentInformationForAccountRecoverySerializerStub.deserialize
        .withArgs(request.payload)
        .resolves(studentInformation);

      const dependencies = {
        studentInformationForAccountRecoverySerializer: studentInformationForAccountRecoverySerializerStub,
      };

      // when
      const response = await accountRecoveryController.sendEmailForAccountRecovery(request, hFake, dependencies);

      // then
      expect(usecases.sendEmailForAccountRecovery).calledWith({ studentInformation });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#checkAccountRecoveryDemand', function () {
    it('should return serialized account recovery details', async function () {
      // given
      const temporaryKey = 'ABCDEFZEFDD';
      const studentInformation = { id: 1234, email: 'philipe@example.net', firstName: 'philipe' };
      const request = {
        params: { temporaryKey },
      };
      sinon.stub(usecases, 'getAccountRecoveryDetails');

      const studentInformationForAccountRecoverySerializerStub = {
        serializeAccountRecovery: sinon.stub(),
      };

      const dependencies = {
        studentInformationForAccountRecoverySerializer: studentInformationForAccountRecoverySerializerStub,
      };

      usecases.getAccountRecoveryDetails.resolves(studentInformation);

      // when
      await accountRecoveryController.checkAccountRecoveryDemand(request, hFake, dependencies);

      // then
      expect(usecases.getAccountRecoveryDetails).to.have.been.calledWith({ temporaryKey });
      expect(studentInformationForAccountRecoverySerializerStub.serializeAccountRecovery).to.have.been.calledWith(
        studentInformation
      );
    });
  });

  describe('#updateUserForAccountRecovery', function () {
    it('should call updateUserForAccountRecovery usecase and return 204', async function () {
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

      sinon.stub(usecases, 'updateUserForAccountRecovery').resolves();
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      // when
      const response = await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(usecases.updateUserForAccountRecovery).calledWithMatch({
        password: user.password,
        temporaryKey,
        domainTransaction,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
