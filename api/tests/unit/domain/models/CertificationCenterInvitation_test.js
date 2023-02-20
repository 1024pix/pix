import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';
import { expect, sinon } from '../../../test-helper';
import { EntityValidationError } from '../../../../lib/domain/errors';
import randomString from 'randomstring';

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

  describe('#create', function () {
    it('should create a new certification center invitation', function () {
      // given
      const now = new Date('2022-03-02');

      // when
      const result = CertificationCenterInvitation.create({
        certificationCenterId: 7,
        email: 'new@example.net',
        updatedAt: now,
        code: '666AAALLL9',
      });

      // /then
      expect(result).to.be.instanceOf(CertificationCenterInvitation);
      expect(result).to.deep.equal({
        email: 'new@example.net',
        certificationCenterId: 7,
        status: CertificationCenterInvitation.StatusType.PENDING,
        updatedAt: now,
        code: '666AAALLL9',
      });
    });
  });

  describe('#generateCode', function () {
    it('should generate a code with 10 characters', function () {
      // given
      sinon.stub(randomString, 'generate');

      // when
      CertificationCenterInvitation.generateCode();

      // /then
      expect(randomString.generate).to.have.been.calledWithExactly({ length: 10, capitalization: 'uppercase' });
    });
  });
});
