import { accountRecoveryController } from '../../../../../src/identity-access-management/application/account-recovery/account-recovery.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | account-recovery', function () {
  describe('#checkAccountRecoveryDemand', function () {
    it('returns serialized account recovery details', async function () {
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
      expect(usecases.getAccountRecoveryDetails).to.have.been.calledWithExactly({ temporaryKey });
      expect(
        studentInformationForAccountRecoverySerializerStub.serializeAccountRecovery,
      ).to.have.been.calledWithExactly(studentInformation);
    });
  });

  describe('#sendEmailForAccountRecovery', function () {
    it('calls sendEmailForAccountRecovery usecase and return 204', async function () {
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

  describe('#updateUserForAccountRecovery', function () {
    it('calls updateUserForAccountRecovery usecase and return 204', async function () {
      // given
      const user = domainBuilder.buildUser({ id: 1 });
      const temporaryKey = 'validTemporaryKey';

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
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda();
      });

      // when
      const response = await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(usecases.updateUserForAccountRecovery).calledWithMatch({
        password: user.password,
        temporaryKey,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
