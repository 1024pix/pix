const { expect, sinon, hFake } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const studentInformationForAccountRecoverySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js');
const schoolingRegistrationDependantUserController = require('../../../../lib/application/schooling-registration-dependent-users/schooling-registration-dependent-user-controller');

describe('Unit | Application | Controller | schooling-registration-user-associations', function () {
  describe('#checkScoAccountRecovery', function () {
    it('should return student account information serialized', async function () {
      // given
      const studentInformation = {
        ineIna: '1234567890A',
        firstName: 'Bob',
        lastName: 'Camond',
        birthdate: '2001-12-08',
      };
      const request = {
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

      sinon
        .stub(studentInformationForAccountRecoverySerializer, 'deserialize')
        .withArgs(request.payload)
        .resolves(studentInformation);
      sinon.stub(usecases, 'checkScoAccountRecovery');
      usecases.checkScoAccountRecovery.withArgs({ studentInformation }).resolves(studentInformationForAccountRecovery);
      sinon
        .stub(studentInformationForAccountRecoverySerializer, 'serialize')
        .withArgs(studentInformationForAccountRecovery)
        .returns(studentInformationForAccountRecoveryJSONAPI);

      // when
      const response = await schoolingRegistrationDependantUserController.checkScoAccountRecovery(request);

      // then
      expect(response).to.deep.equal(studentInformationForAccountRecoveryJSONAPI);
    });
  });

  describe('#createUserAndReconcileToSchoolingRegistrationFromExternalUser', function () {
    it('should return 200 response with an access token', async function () {
      // given
      const request = {
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

      sinon.stub(usecases, 'createUserAndReconcileToSchoolingRegistrationFromExternalUser').resolves(token);

      // when
      const response =
        await schoolingRegistrationDependantUserController.createUserAndReconcileToSchoolingRegistrationFromExternalUser(
          request,
          hFake
        );

      // then
      expect(response.source.data.attributes['access-token']).to.deep.equal(token);
      expect(response.statusCode).to.equal(200);
    });
  });
});
