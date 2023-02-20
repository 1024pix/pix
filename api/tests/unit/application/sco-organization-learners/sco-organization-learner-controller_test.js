import { expect, hFake, sinon } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';
import scoOrganizationLearnerController from '../../../../lib/application/sco-organization-learners/sco-organization-learner-controller';
import studentInformationForAccountRecoverySerializer from '../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer';

describe('Unit | Application | Controller | sco-organization-learner', function () {
  describe('#createUserAndReconcileToOrganizationLearnerFromExternalUser', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createUserAndReconcileToOrganizationLearnerFromExternalUser');
      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves();
    });

    it('should return 200 response with an access token', async function () {
      // given
      hFake.request = { path: {} };
      request = {
        payload: {
          data: {
            attributes: {
              birthdate: '01-01-2000',
              'campaign-code': 'BADGES123',
              'external-user-token': '123SamlId',
            },
          },
        },
      };
      const token = Symbol('token');

      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves(token);

      // when
      const response =
        await scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser(
          request,
          hFake
        );

      // then
      expect(response.source.data.attributes['access-token']).to.deep.equal(token);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkScoAccountRecovery', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'checkScoAccountRecovery');
      usecases.checkScoAccountRecovery.resolves();
      sinon.stub(studentInformationForAccountRecoverySerializer, 'serialize');
      studentInformationForAccountRecoverySerializer.serialize.resolves();
      sinon.stub(studentInformationForAccountRecoverySerializer, 'deserialize');
      studentInformationForAccountRecoverySerializer.deserialize.resolves();
    });

    it('should return student account information serialized', async function () {
      // given
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
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(request, hFake);

      // then
      expect(response.source).to.deep.equal(studentInformationForAccountRecoveryJSONAPI);
    });
  });
});
