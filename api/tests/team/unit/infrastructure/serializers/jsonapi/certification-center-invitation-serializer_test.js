import { CertificationCenterInvitation } from '../../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { certificationCenterInvitationSerializer } from '../../../../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Team | Serializer | JSONAPI | certification-center-invitation-serializer', function () {
  describe('#serialize', function () {
    it('converts a certification-center-invitation object into JSON API data', function () {
      // given
      const invitation = new CertificationCenterInvitation({
        id: 999,
        certificationCenterId: 712,
        certificationCenterName: 'Centre Pix',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      // when
      const json = certificationCenterInvitationSerializer.serialize(invitation);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'certification-center-invitations',
          id: '999',
          attributes: {
            'certification-center-id': 712,
            'certification-center-name': 'Centre Pix',
            status: CertificationCenterInvitation.StatusType.PENDING,
          },
        },
      });
    });
  });

  describe('#serializeForAdmin', function () {
    it('converts a certification-center-invitation object into JSON API data', function () {
      // given
      const now = new Date();
      const certificationCenterInvitation = new CertificationCenterInvitation({
        id: 7,
        certificationCenterId: 666,
        email: 'anne.atole@example.net',
        role: 'MEMBER',
        locale: 'fr',
        updatedAt: now,
      });

      // when
      const json = certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'certification-center-invitations',
          id: '7',
          attributes: {
            email: 'anne.atole@example.net',
            'updated-at': now,
            role: 'MEMBER',
            locale: 'fr',
          },
        },
      });
    });
  });

  describe('#deserializeForAdmin', function () {
    it('converts the JSON payload to Object', async function () {
      //given
      const payload = {
        data: {
          type: 'certification-center-invitations',
          attributes: {
            locale: 'fr-FR',
            email: 'email@example.net',
            role: 'ADMIN',
          },
        },
      };

      // when
      const json = await certificationCenterInvitationSerializer.deserializeForAdmin(payload);

      // then
      expect(json).to.deep.equal({
        locale: 'fr-FR',
        email: 'email@example.net',
        role: 'ADMIN',
      });
    });
  });
});
