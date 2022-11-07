const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');
const { expect } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CertificationCenterInvitation', function () {
  describe('constructor', function () {
    it('should build a CertificationCenterInvitation from raw JSON', function () {
      // given
      const today = new Date();

      const rawData = {
        id: 1,
        email: 'pixou1@team.org',
        updatedAt: today,
        status: 'pending',
        certificationCenterId: 10,
        certificationCenterName: 'La Raclette des Pixous',
        code: 'ABCDE',
      };

      // when
      const invitation = new CertificationCenterInvitation(rawData);

      // then
      expect(invitation).to.deep.equal(rawData);
    });

    it('should not build an CertificationCenterInvitation if JSON is not valid', async function () {
      // given
      const today = new Date();

      const rawData = {
        id: 'un',
        email: 'pixou1@team.org',
        updatedAt: today,
        status: 'pending',
        certificationCenterId: 10,
        certificationCenterName: 'La Raclette des Pixous',
      };

      // when / then
      expect(() => {
        new CertificationCenterInvitation(rawData);
      }).not.to.throw(EntityValidationError);
    });
  });

  describe('isPending', function () {
    it('should return true if CertificationCenterInvitation status is pending', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'pending' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if CertificationCenterInvitation status is different than pending', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'accepted' });

      // when
      const result = invitation.isPending;

      // /then
      expect(result).to.be.false;
    });
  });

  describe('isAccepted', function () {
    it('should return true if CertificationCenterInvitation status is isAccepted', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'accepted' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if CertificationCenterInvitation status is different than accepted', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'pending' });

      // when
      const result = invitation.isAccepted;

      // /then
      expect(result).to.be.false;
    });
  });

  describe('isCancelled', function () {
    it('should return true if CertificationCenterInvitation status is cancelled', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'cancelled' });

      // when
      const result = invitation.isCancelled;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if CertificationCenterInvitation status is different than cancelled', function () {
      // given
      const invitation = new CertificationCenterInvitation({ status: 'pending' });

      // when
      const result = invitation.isCancelled;

      // /then
      expect(result).to.be.false;
    });
  });
});
