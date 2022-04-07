const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/schooling-registration-dependent-user-serializer');

describe('Unit | Serializer | JSONAPI | schooling-registration-dependent-user-serializer', function () {
  describe('#serialize', function () {
    it('should convert a schooling-registration-dependent-user object into JSON API data', function () {
      // given
      const organizationLearnerWithUsernameAndPassword = domainBuilder.buildOrganizationLearner();
      organizationLearnerWithUsernameAndPassword.username = 'john.harry0702';
      organizationLearnerWithUsernameAndPassword.generatedPassword = 'AZFETGFR';

      const expectedOrganizationLearnerJson = {
        data: {
          type: 'schooling-registration-dependent-users',
          id: organizationLearnerWithUsernameAndPassword.id.toString(),
          attributes: {
            username: 'john.harry0702',
            'generated-password': 'AZFETGFR',
          },
        },
      };

      // when
      const json = serializer.serialize(organizationLearnerWithUsernameAndPassword);

      // then
      expect(json).to.deep.equal(expectedOrganizationLearnerJson);
    });
  });
});
