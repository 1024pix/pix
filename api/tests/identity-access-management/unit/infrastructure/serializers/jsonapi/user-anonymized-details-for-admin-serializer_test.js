import { userAnonymizedDetailsForAdminSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/user-anonymized-details-for-admin.serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Serializer | JSONAPI | user-anonymized-details-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('serializes user details for Pix Admin', function () {
      // given
      const now = new Date();
      const modelObject = domainBuilder.buildUserDetailsForAdmin({
        organizationLearners: [domainBuilder.buildOrganizationLearnerForAdmin()],
        authenticationMethods: [{ id: 1, identityProvider: 'PIX' }],
        updatedAt: now,
      });

      // when
      const json = userAnonymizedDetailsForAdminSerializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'first-name': modelObject.firstName,
            'last-name': modelObject.lastName,
            email: modelObject.email,
            username: modelObject.username,
            cgu: modelObject.cgu,
            'pix-certif-terms-of-service-accepted': modelObject.pixCertifTermsOfServiceAccepted,
            'has-been-anonymised': modelObject.hasBeenAnonymised,
            'anonymised-by-full-name': modelObject.anonymisedByFullName,
            'updated-at': now,
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
