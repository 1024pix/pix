const { expect } = require('../../../../test-helper');
const UserDetailsForAdmin = require('../../../../../lib/domain/models/UserDetailsForAdmin');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-details-for-admin-serializer');

describe('Unit | Serializer | JSONAPI | user-details-for-admin-serializer', () => {

  describe('#serialize', () => {

    it('should serialize user details for Pix Admin', () => {
      // given
      const modelObject = new UserDetailsForAdmin({
        id: '234567',
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
        username: 'luke.skywalker1234',
        cgu: true,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false,
        isAuthenticatedFromGAR: false,
      });

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            'email': 'lskywalker@deathstar.empire',
            'username': 'luke.skywalker1234',
            'cgu': true,
            'pix-orga-terms-of-service-accepted': false,
            'pix-certif-terms-of-service-accepted': false,
            'is-authenticated-from-gar': false,
          },
          id: '234567',
          type: 'users',
        }
      });
    });
  });

  describe('#deserialize()', () => {

    let jsonUser;

    beforeEach(() => {
      jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
          }
        }
      };
    });

    it('should convert JSON API data into a map object that contain attribute to patch', () => {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
    });
  });

});
