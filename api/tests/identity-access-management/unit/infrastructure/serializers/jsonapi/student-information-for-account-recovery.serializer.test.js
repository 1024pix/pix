import { StudentInformationForAccountRecovery } from '../../../../../../src/identity-access-management/domain/read-models/StudentInformationForAccountRecovery.js';
import { studentInformationForAccountRecoverySerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/student-information-for-account-recovery.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | student-information-for-account-recovery', function () {
  describe('#serialize()', function () {
    it('converts a StudentInformationForAccountRecovery model object into JSON API data', function () {
      // given
      const modelStudentInformationForAccountRecovery = new StudentInformationForAccountRecovery({
        firstName: 'Jude',
        lastName: 'Law',
        username: 'jude.law0106',
        email: 'judelaw@example.net',
        latestOrganizationName: 'Hollywood',
      });

      // when
      const json = studentInformationForAccountRecoverySerializer.serialize(modelStudentInformationForAccountRecovery);

      // then
      const expectedJsonApi = {
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'first-name': modelStudentInformationForAccountRecovery.firstName,
            'last-name': modelStudentInformationForAccountRecovery.lastName,
            username: modelStudentInformationForAccountRecovery.username,
            email: modelStudentInformationForAccountRecovery.email,
            'latest-organization-name': modelStudentInformationForAccountRecovery.latestOrganizationName,
          },
        },
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });

  describe('#serializeAccountRecovery()', function () {
    it('converts an account recovery demand into JSON API data', function () {
      // given
      const accountRecoveryDetails = {
        id: 1,
        firstName: 'Jude',
        email: 'judelaw@example.net',
        hasGarAuthenticationMethod: true,
        hasScoUsername: false,
      };

      // when
      const json = studentInformationForAccountRecoverySerializer.serializeAccountRecovery(accountRecoveryDetails);

      // then
      const expectedJsonApi = {
        data: {
          type: 'account-recovery-demands',
          id: accountRecoveryDetails.id.toString(),
          attributes: {
            'first-name': accountRecoveryDetails.firstName,
            email: accountRecoveryDetails.email,
            'has-gar-authentication-method': true,
            'has-sco-username': false,
          },
        },
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });

  describe('#deserialize()', function () {
    it('converts the payload json to student information', async function () {
      // given
      const payload = {
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'ine-ina': '123456789BB',
            'first-name': 'george',
            'last-name': 'de cambridge',
            birthdate: '2013-07-22',
            email: 'email@example.net',
          },
        },
      };

      // when
      const json = await studentInformationForAccountRecoverySerializer.deserialize(payload);

      // then
      const expectedJsonApi = {
        firstName: 'george',
        lastName: 'de cambridge',
        ineIna: '123456789BB',
        birthdate: '2013-07-22',
        email: 'email@example.net',
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });

    it('does not return undefined email when none exist in payload', async function () {
      // given
      const payload = {
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'ine-ina': '123456789BB',
            'first-name': 'george',
            'last-name': 'de cambridge',
            birthdate: '2013-07-22',
          },
        },
      };

      // when
      const json = await studentInformationForAccountRecoverySerializer.deserialize(payload);

      // then
      const expectedJsonApi = {
        firstName: 'george',
        lastName: 'de cambridge',
        ineIna: '123456789BB',
        birthdate: '2013-07-22',
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
