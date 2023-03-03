const { expect } = require('../../../../../test-helper');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/organization-learner-follow-up/organization-learner-serializer');
const OrganizationLearner = require('../../../../../../lib/domain/read-models/organization-learner-follow-up/OrganizationLearner');

describe('Unit | Serializer | JSONAPI | organization-learner-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 7,
        firstName: 'Kassos',
        lastName: 'Arthur',
        email: 'King.Arthur@kassos.fr',
        username: 'Arthur.Kassos',
        authenticationMethods: ['PIX', 'GAR'],
        division: 'ABC',
        group: 'AE',
        isCertifiable: true,
        certifiableAt: '2022-03-01',
      });

      const expectedSerializedOrganizationLearner = {
        data: {
          type: 'organization-learners',
          id: '7',
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            email: organizationLearner.email,
            username: organizationLearner.username,
            'authentication-methods': organizationLearner.authenticationMethods,
            division: organizationLearner.division,
            group: organizationLearner.group,
            'is-certifiable': organizationLearner.isCertifiable,
            'certifiable-at': organizationLearner.certifiableAt,
          },
        },
      };

      // when
      const json = serializer.serialize(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });
});
