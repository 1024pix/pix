const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases/index.js');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');
const {
  NotFoundError,
  AlreadyExistingInvitationError,
  CancelledInvitationError,
} = require('../../../../lib/domain/errors');

describe('Integration | API | getCertificationCenterInvitation', function () {
  describe('when an invitation exists', function () {
    it('should return an invitation information', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Konoha' });

      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'kakashi-certif@leaf.com',
        status: CertificationCenterInvitation.StatusType.PENDING,
        code: 'PAIN999',
      });

      const konohaInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'konoha-certif@leaf.com',
        status: CertificationCenterInvitation.StatusType.PENDING,
        code: 'PAIN999',
      });

      await databaseBuilder.commit();

      // when
      const result = await useCases.getCertificationCenterInvitation({
        certificationCenterInvitationId: konohaInvitation.id,
        certificationCenterInvitationCode: 'PAIN999',
      });

      // then
      const fakeCertificationCenterInvitation = new CertificationCenterInvitation({
        id: konohaInvitation.id,
        certificationCenterId: certificationCenter.id,
        certificationCenterName: 'Konoha',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      expect(result).to.deepEqualInstance(fakeCertificationCenterInvitation);
    });
  });

  describe('when an invitation does not exist', function () {
    it('should throw a not found error', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Konoha' });

      const konohaInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'konoha-certif@leaf.com',
        status: CertificationCenterInvitation.StatusType.PENDING,
        code: 'MHA789',
      });

      await databaseBuilder.commit();

      // when
      const error = await catchErr(useCases.getCertificationCenterInvitation)({
        certificationCenterInvitationId: konohaInvitation.id,
        certificationCenterInvitationCode: 'WRONGCODE01',
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal("L'invitation à ce centre de certification n'existe pas");
    });
  });

  describe('when an invitation is already accepted', function () {
    it('should throw an already existing invitation error', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'HunterxHunter' });

      const killuaInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'brigadefantome@hxh.com',
        status: CertificationCenterInvitation.StatusType.ACCEPTED,
        code: 'HXH456',
      });

      await databaseBuilder.commit();

      // when
      const error = await catchErr(useCases.getCertificationCenterInvitation)({
        certificationCenterInvitationId: killuaInvitation.id,
        certificationCenterInvitationCode: 'HXH456',
      });

      // then
      expect(error).to.be.instanceof(AlreadyExistingInvitationError);
      expect(error.message).to.equal(`L'invitation avec l'id ${killuaInvitation.id} a déjà été acceptée.`);
    });
  });

  describe('when an invitation is cancelled', function () {
    it('should throw a cancelled invitation error', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'MyHeroAcademia' });

      const dekuInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'superheros@mha.com',
        status: CertificationCenterInvitation.StatusType.CANCELLED,
        code: 'MHA789',
      });

      await databaseBuilder.commit();

      // when
      const error = await catchErr(useCases.getCertificationCenterInvitation)({
        certificationCenterInvitationId: dekuInvitation.id,
        certificationCenterInvitationCode: 'MHA789',
      });

      // then
      expect(error).to.be.instanceof(CancelledInvitationError);
      expect(error.message).to.equal(`L'invitation avec l'id ${dekuInvitation.id} a été annulée.`);
    });
  });
});
