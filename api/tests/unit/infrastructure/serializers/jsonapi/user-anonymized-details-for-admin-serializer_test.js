const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-anonymized-details-for-admin-serializer');

describe('Unit | Serializer | JSONAPI | user-details-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should serialize user details for Pix Admin', function () {
      // given
      const modelObject = domainBuilder.buildUserDetailsForAdmin({
        schoolingRegistrations: [domainBuilder.buildSchoolingRegistrationForAdmin()],
        authenticationMethods: [{ id: 1, identityProvider: 'PIX' }],
      });

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'first-name': modelObject.firstName,
            'last-name': modelObject.lastName,
            email: modelObject.email,
            username: modelObject.username,
            cgu: modelObject.cgu,
            'pix-orga-terms-of-service-accepted': modelObject.pixOrgaTermsOfServiceAccepted,
            'pix-certif-terms-of-service-accepted': modelObject.pixCertifTermsOfServiceAccepted,
          },
          relationships: {
            'authentication-methods': {
              data: [
                {
                  id: `${modelObject.authenticationMethods[0].id}`,
                  type: 'authenticationMethods',
                },
              ],
            },
          },
          id: `${modelObject.id}`,
          type: 'users',
        },
        included: [
          {
            attributes: {
              'identity-provider': modelObject.authenticationMethods[0].identityProvider,
            },
            id: `${modelObject.authenticationMethods[0].id}`,
            type: 'authenticationMethods',
          },
        ],
      });
    });
  });
});
