import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { CertificationCenterInvitation } from '../../../../../lib/domain/models/CertificationCenterInvitation.js';

describe('Unit | Serializer | JSONAPI | certification-center-invitation-serializer', function () {
  describe('#serialize', function () {
    it('should convert a certification-center-invitation object into JSON API data', function () {
      // given
      const invitation = new CertificationCenterInvitation({
        id: 999,
        certificationCenterId: 712,
        certificationCenterName: 'Centre Pix',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      // when
      const json = serializer.serialize(invitation);

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
    it('should convert a certification-center-invitation object into JSON API data', function () {
      // given
      const now = new Date();
      const certificationCenterInvitation = new CertificationCenterInvitation({
        id: 7,
        certificationCenterId: 666,
        email: 'anne.atole@example.net',
        role: 'MEMBER',
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
            email: 'anne.atole@example.net',
            'updated-at': now,
            role: 'MEMBER',
          },
        },
      });
    });
  });

  describe('#deserializeForAdmin', function () {
    it('should convert the JSON payload to Object', async function () {
      //given
      const payload = {
        data: {
          type: 'certification-center-invitations',
          attributes: {
            language: 'fr-fr',
            email: 'email@example.net',
            role: 'ADMIN',
          },
        },
      };

      // when
      const json = await serializer.deserializeForAdmin(payload);

      // then
      expect(json).to.deep.equal({
        language: 'fr-fr',
        email: 'email@example.net',
        role: 'ADMIN',
      });
    });
  });
});
