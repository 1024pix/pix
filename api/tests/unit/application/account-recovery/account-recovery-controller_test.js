import { accountRecoveryController } from '../../../../lib/application/account-recovery/account-recovery-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

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
});
