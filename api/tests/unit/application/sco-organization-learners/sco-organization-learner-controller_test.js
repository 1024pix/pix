import { scoOrganizationLearnerController } from '../../../../lib/application/sco-organization-learners/sco-organization-learner-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Application | Controller | sco-organization-learner', function () {
  describe('#checkScoAccountRecovery', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'checkScoAccountRecovery');
      usecases.checkScoAccountRecovery.resolves();
    });

    it('should return student account information serialized', async function () {
      // given
      const studentInformationForAccountRecoverySerializer = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      hFake.request = { path: {} };
      const studentInformation = {
        ineIna: '1234567890A',
        firstName: 'Bob',
        lastName: 'Camond',
        birthdate: '2001-12-08',
      };
      request = {
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };
      const studentInformationForAccountRecovery = Symbol();
      const studentInformationForAccountRecoveryJSONAPI = Symbol();

      studentInformationForAccountRecoverySerializer.deserialize.withArgs(request.payload).resolves(studentInformation);
      usecases.checkScoAccountRecovery.withArgs({ studentInformation }).resolves(studentInformationForAccountRecovery);
      studentInformationForAccountRecoverySerializer.serialize
        .withArgs(studentInformationForAccountRecovery)
        .returns(studentInformationForAccountRecoveryJSONAPI);

      // when
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(request, hFake, {
        studentInformationForAccountRecoverySerializer,
      });

      // then
      expect(response.source).to.deep.equal(studentInformationForAccountRecoveryJSONAPI);
    });
  });
});
