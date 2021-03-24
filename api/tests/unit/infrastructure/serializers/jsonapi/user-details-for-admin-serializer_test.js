const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-details-for-admin-serializer');

describe('Unit | Serializer | JSONAPI | user-details-for-admin-serializer', function() {

  describe('#serialize', function() {

    it('should serialize user details for Pix Admin', function() {
      // given
      const modelObject = domainBuilder.buildUserDetailsForAdmin({
        schoolingRegistrations: [domainBuilder.buildSchoolingRegistrationForAdmin()],
      });

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'first-name': modelObject.firstName,
            'last-name': modelObject.lastName,
            'email': modelObject.email,
            'username': modelObject.username,
            'cgu': modelObject.cgu,
            'pix-orga-terms-of-service-accepted': modelObject.pixOrgaTermsOfServiceAccepted,
            'pix-certif-terms-of-service-accepted': modelObject.pixCertifTermsOfServiceAccepted,
            'is-authenticated-from-gar': modelObject.isAuthenticatedFromGAR,
          },
          relationships: {
            'schooling-registrations': {
              'data': [{
                'id': `${modelObject.schoolingRegistrations[0].id}`,
                'type': 'schoolingRegistrations',
              }],
            },
          },
          id: `${modelObject.id}`,
          type: 'users',
        },
        included: [{
          attributes: {
            'first-name': modelObject.schoolingRegistrations[0].firstName,
            'last-name': modelObject.schoolingRegistrations[0].lastName,
            'birthdate': modelObject.schoolingRegistrations[0].birthdate,
            'division': modelObject.schoolingRegistrations[0].division,
            'organization-id': modelObject.schoolingRegistrations[0].organizationId,
            'organization-external-id': modelObject.schoolingRegistrations[0].organizationExternalId,
            'organization-name': modelObject.schoolingRegistrations[0].organizationName,
            'created-at': modelObject.schoolingRegistrations[0].createdAt,
            'updated-at': modelObject.schoolingRegistrations[0].updatedAt,
          },
          'id': `${modelObject.schoolingRegistrations[0].id}`,
          'type': 'schoolingRegistrations',
        }],
      });
    });
  });

  describe('#deserialize()', function() {

    let jsonUser;

    beforeEach(function() {
      jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
          },
        },
      };
    });

    it('should convert JSON API data into a map object that contain attribute to patch', function() {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
    });
  });

});
