const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-learner-dependent-user-serializer');

describe('Unit | Serializer | JSONAPI | organization-learner-dependent-user-serializer', function () {
  describe('#serialize', function () {
    it('should convert a organization-learner-dependent-user object into JSON API data', function () {
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
