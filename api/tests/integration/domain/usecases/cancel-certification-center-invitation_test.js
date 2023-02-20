import { catchErr, databaseBuilder, expect } from '../../../test-helper';
import sinon from 'sinon';
import useCases from '../../../../lib/domain/usecases';
import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';
import { NotFoundError, UncancellableCertificationCenterInvitationError } from '../../../../lib/domain/errors';

describe('Integration | UseCases | cancel-certification-center-invitation', function () {
  describe('when the invitation exists', function () {
    let clock;
    const now = new Date('2022-09-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers(now.getTime());
    });

    afterEach(async function () {
      clock.restore();
    });

    describe('when the invitation is pending', function () {
      it('should be possible to cancel a certification center invitation', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

        databaseBuilder.factory.buildCertificationCenterInvitation({
          id: 123,
          certificationCenterId,
          updatedAt: new Date('2022-08-09'),
        });

        const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
          id: 456,
          email: 'ploup.user@example.net',
          certificationCenterId,
          status: CertificationCenterInvitation.StatusType.PENDING,
          updatedAt: new Date('2022-08-08'),
        });

        await databaseBuilder.commit();

        // when
        const result = await useCases.cancelCertificationCenterInvitation({
          certificationCenterInvitationId: certificationCenterInvitation.id,
        });

        // then
        expect(result).to.be.instanceOf(CertificationCenterInvitation);
        expect(result).to.deep.include({
          id: certificationCenterInvitation.id,
          email: 'ploup.user@example.net',
          status: CertificationCenterInvitation.StatusType.CANCELLED,
          certificationCenterId,
          updatedAt: now,
        });
      });
    });

    describe('when the invitation is already accepted or cancelled', function () {
      it('should throw an error', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

        const acceptedInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
          email: 'ploup.user@example.net',
          certificationCenterId,
          status: CertificationCenterInvitation.StatusType.ACCEPTED,
          updatedAt: new Date('2022-08-08'),
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(useCases.cancelCertificationCenterInvitation)({
          certificationCenterInvitationId: acceptedInvitation.id,
        });

        // then
        expect(error).to.be.instanceof(UncancellableCertificationCenterInvitationError);
        expect(error.message).to.equal("L'invitation à ce centre de certification ne peut pas être annulée.");
      });
    });
  });

  describe('when the invitation does not exist', function () {
    it('should throw an error', async function () {
      // given
      const certificationCenterInvitationId = 123;

      // when
      const error = await catchErr(useCases.cancelCertificationCenterInvitation)({
        certificationCenterInvitationId,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal("L'invitation à ce centre de certification n'existe pas");
    });
  });
});
