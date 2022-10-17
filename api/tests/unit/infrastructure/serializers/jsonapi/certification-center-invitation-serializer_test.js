const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer');
const CertificationCenterInvitation = require('../../../../../lib/domain/models/CertificationCenterInvitation');

describe('Unit | Serializer | JSONAPI | certification-center-invitation-serializer', function () {
  describe('#serializeForAdmin', function () {
    it('should convert a certification-center-invitation object into JSON API data', function () {
      // given
      const now = new Date();
      const certificationCenterInvitation = new CertificationCenterInvitation({
        id: 7,
        certificationCenterId: 666,
        email: 'anne.atole@example.net',
        updatedAt: now,
      });

      // when
      const json = serializer.serializeForAdmin(certificationCenterInvitation);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'certification-center-invitations',
          id: '7',
          attributes: {
            'certification-center-id': 666,
            email: 'anne.atole@example.net',
            'updated-at': now,
          },
        },
      });
    });
  });
});
