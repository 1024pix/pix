const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/schooling-registration-dependent-user-serializer');

describe('Unit | Serializer | JSONAPI | schooling-registration-dependent-user-serializer', function () {
  describe('#serialize', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const schoolingRegistrationWithUsernameAndPassword = domainBuilder.buildSchoolingRegistration();
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    schoolingRegistrationWithUsernameAndPassword.username = 'john.harry0702';
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    schoolingRegistrationWithUsernameAndPassword.generatedPassword = 'AZFETGFR';

    const expectedSchoolingRegistrationJson = {
      data: {
        type: 'schooling-registration-dependent-users',
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        id: schoolingRegistrationWithUsernameAndPassword.id.toString(),
        attributes: {
          username: 'john.harry0702',
          'generated-password': 'AZFETGFR',
        },
      },
    };

    it('should convert a schooling-registration-dependent-user object into JSON API data', function () {
      // when
      const json = serializer.serialize(schoolingRegistrationWithUsernameAndPassword);

      // then
      expect(json).to.deep.equal(expectedSchoolingRegistrationJson);
    });
  });
});
