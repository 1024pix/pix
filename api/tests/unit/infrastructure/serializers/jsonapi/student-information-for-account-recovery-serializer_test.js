const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js');
const StudentInformationForAccountRecovery = require('../../../../../lib/domain/read-models/StudentInformationForAccountRecovery');

describe('Unit | Serializer | JSONAPI | student-information-for-account-recovery-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a StudentInformationForAccountRecovery model object into JSON API data', function() {
      //given
      const modelStudentInformationForAccountRecovery = new StudentInformationForAccountRecovery({
        firstName: 'Jude',
        lastName: 'Law',
        username: 'jude.law0106',
        email: 'judelaw@example.net',
        latestOrganizationName: 'Hollywood',
      });

      // when
      const json = serializer.serialize(modelStudentInformationForAccountRecovery);

      // then
      const expectedJsonApi = {
        data: {
          type: 'student-information-for-account-recoveries',
          attributes: {
            'first-name': modelStudentInformationForAccountRecovery.firstName,
            'last-name': modelStudentInformationForAccountRecovery.lastName,
            'username': modelStudentInformationForAccountRecovery.username,
            'email': modelStudentInformationForAccountRecovery.email,
            'latest-organization-name': modelStudentInformationForAccountRecovery.latestOrganizationName,
          },
        },
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
