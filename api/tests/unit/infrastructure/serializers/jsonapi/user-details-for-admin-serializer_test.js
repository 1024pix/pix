import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-details-for-admin-serializer';

describe('Unit | Serializer | JSONAPI | user-details-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('serializes user details for Pix Admin', function () {
      // given
      const now = new Date();
      const userDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
        createdAt: now,
        lang: 'fr',
        lastTermsOfServiceValidatedAt: now,
        lastPixOrgaTermsOfServiceValidatedAt: now,
        lastPixCertifTermsOfServiceValidatedAt: now,
        lastLoggedAt: now,
        emailConfirmedAt: now,
        hasBeenAnonymised: false,
        anonymisedByFullName: null,
        organizationLearners: [domainBuilder.buildOrganizationLearnerForAdmin()],
        authenticationMethods: [
          { id: 1, identityProvider: 'PIX', authenticationComplement: { shouldChangePassword: true } },
        ],
        userLogin: [{ id: 123, failureCount: 8 }],
      });

      // when
      const json = serializer.serialize(userDetailsForAdmin);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'first-name': userDetailsForAdmin.firstName,
            'last-name': userDetailsForAdmin.lastName,
            email: userDetailsForAdmin.email,
            username: userDetailsForAdmin.username,
            'created-at': userDetailsForAdmin.createdAt,
            cgu: userDetailsForAdmin.cgu,
            'pix-orga-terms-of-service-accepted': userDetailsForAdmin.pixOrgaTermsOfServiceAccepted,
            'pix-certif-terms-of-service-accepted': userDetailsForAdmin.pixCertifTermsOfServiceAccepted,
            lang: 'fr',
            'last-terms-of-service-validated-at': now,
            'last-pix-orga-terms-of-service-validated-at': now,
            'last-pix-certif-terms-of-service-validated-at': now,
            'last-logged-at': now,
            'email-confirmed-at': now,
            'has-been-anonymised': false,
            'anonymised-by-full-name': null,
          },
          relationships: {
            'certification-center-memberships': {
              links: {
                related: '/api/admin/users/123/certification-center-memberships',
              },
            },
            'organization-learners': {
              data: [
                {
                  id: `${userDetailsForAdmin.organizationLearners[0].id}`,
                  type: 'organizationLearners',
                },
              ],
            },
            'authentication-methods': {
              data: [
                {
                  id: `${userDetailsForAdmin.authenticationMethods[0].id}`,
                  type: 'authenticationMethods',
                },
              ],
            },
            profile: {
              links: {
                related: `/api/admin/users/${userDetailsForAdmin.id}/profile`,
              },
            },
            'user-login': {
              data: [
                {
                  id: '123',
                  type: 'userLogins',
                },
              ],
            },
            'organization-memberships': {
              links: {
                related: `/api/admin/users/${userDetailsForAdmin.id}/organizations`,
              },
            },
            participations: {
              links: {
                related: `/api/admin/users/${userDetailsForAdmin.id}/participations`,
              },
            },
          },
          id: `${userDetailsForAdmin.id}`,
          type: 'users',
        },
        included: [
          {
            attributes: {
              'first-name': userDetailsForAdmin.organizationLearners[0].firstName,
              'last-name': userDetailsForAdmin.organizationLearners[0].lastName,
              birthdate: userDetailsForAdmin.organizationLearners[0].birthdate,
              division: userDetailsForAdmin.organizationLearners[0].division,
              group: userDetailsForAdmin.organizationLearners[0].group,
              'organization-id': userDetailsForAdmin.organizationLearners[0].organizationId,
              'organization-name': userDetailsForAdmin.organizationLearners[0].organizationName,
              'created-at': userDetailsForAdmin.organizationLearners[0].createdAt,
              'updated-at': userDetailsForAdmin.organizationLearners[0].updatedAt,
              'is-disabled': userDetailsForAdmin.organizationLearners[0].isDisabled,
              'can-be-dissociated': userDetailsForAdmin.organizationLearners[0].canBeDissociated,
            },
            id: `${userDetailsForAdmin.organizationLearners[0].id}`,
            type: 'organizationLearners',
          },
          {
            attributes: {
              'identity-provider': userDetailsForAdmin.authenticationMethods[0].identityProvider,
              'authentication-complement': { shouldChangePassword: true },
            },
            id: `${userDetailsForAdmin.authenticationMethods[0].id}`,
            type: 'authenticationMethods',
          },
          {
            attributes: { 'failure-count': 8 },
            id: '123',
            type: 'userLogins',
          },
        ],
      });
    });
  });

  describe('#serializeForUpdate', function () {
    it('should serialize user details for Pix Admin', function () {
      // given
      const modelObject = domainBuilder.buildUserDetailsForAdmin({
        organizationLearners: [domainBuilder.buildOrganizationLearnerForAdmin()],
        authenticationMethods: [{ id: 1, identityProvider: 'PIX' }],
      });

      // when
      const json = serializer.serializeForUpdate(modelObject);

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
            'organization-learners': {
              data: [
                {
                  id: `${modelObject.organizationLearners[0].id}`,
                  type: 'organizationLearners',
                },
              ],
            },
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
              'first-name': modelObject.organizationLearners[0].firstName,
              'last-name': modelObject.organizationLearners[0].lastName,
              birthdate: modelObject.organizationLearners[0].birthdate,
              division: modelObject.organizationLearners[0].division,
              group: modelObject.organizationLearners[0].group,
              'organization-id': modelObject.organizationLearners[0].organizationId,
              'organization-name': modelObject.organizationLearners[0].organizationName,
              'created-at': modelObject.organizationLearners[0].createdAt,
              'updated-at': modelObject.organizationLearners[0].updatedAt,
              'is-disabled': modelObject.organizationLearners[0].isDisabled,
              'can-be-dissociated': modelObject.organizationLearners[0].canBeDissociated,
            },
            id: `${modelObject.organizationLearners[0].id}`,
            type: 'organizationLearners',
          },
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

  describe('#deserialize', function () {
    let jsonUser;

    beforeEach(function () {
      jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
            username: 'luke.skywalker1212',
          },
        },
      };
    });

    it('should convert JSON API data into a map object that contain attribute to patch', function () {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
      expect(user.username).to.equal('luke.skywalker1212');
    });
  });
});
