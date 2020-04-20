const { expect } = require('../../../../test-helper');
const UserDetailForAdmin = require('../../../../../lib/domain/read-models/UserDetailForAdmin');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-detail-for-admin-serializer');

describe('Unit | Serializer | JSONAPI | user-detail-for-admin-serializer', () => {

  describe('#serialize', () => {

    it('should serialize user detail for Pix Admin', () => {
      // given
      const modelObject = new UserDetailForAdmin({
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
});
