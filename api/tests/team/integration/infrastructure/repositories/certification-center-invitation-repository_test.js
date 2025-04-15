import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import * as certificationCenterInvitationRepository from '../../../../../src/team/infrastructure/repositories/certification-center-invitation-repository.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Team | Infrastructure | Repositories | CertificationCenterInvitationRepository', function () {
  describe('#updateModificationDate', function () {
    it('updates the certification center invitation modification date', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10'),
      });

      await databaseBuilder.commit();

      const now = new Date('2023-10-13');
      const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      // when
      await certificationCenterInvitationRepository.updateModificationDate(certificationCenterInvitation.id);

      // then
      const updatedCertificationCenterInvitation = await knex('certification-center-invitations')
        .where({ id: certificationCenterInvitation.id })
        .first();
      expect(updatedCertificationCenterInvitation.updatedAt).to.deep.equal(now);
      clock.restore();
    });
  });

  describe('#markAsCancelledByCertificationCenter', function () {
    it('cancels all pending invitations of a given certification center', async function () {
      // given
      const previousUpdate = new Date(2020, 10, 31);
      const cancelDate = new Date(2021, 10, 31);
      const pendingStatus = CertificationCenterInvitation.StatusType.PENDING;
      const cancelledStatus = CertificationCenterInvitation.StatusType.CANCELLED;
      const acceptedStatus = CertificationCenterInvitation.StatusType.ACCEPTED;

      const thisCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: thisCertificationCenterId,
        status: pendingStatus,
        updatedAt: previousUpdate,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: thisCertificationCenterId,
        status: acceptedStatus,
        updatedAt: previousUpdate,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: thisCertificationCenterId,
        status: cancelledStatus,
        updatedAt: previousUpdate,
      });

      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: otherCertificationCenterId,
        status: pendingStatus,
        updatedAt: previousUpdate,
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterInvitationRepository.markAsCancelledByCertificationCenter({
        certificationCenterId: thisCertificationCenterId,
        updatedAt: cancelDate,
      });

      // then
      const thisCenterPendingInvitations = await knex('certification-center-invitations').where({
        certificationCenterId: thisCertificationCenterId,
        status: pendingStatus,
      });
      expect(thisCenterPendingInvitations).to.have.lengthOf(0);

      const allCancelledInvitationsOfThisCenter = await knex('certification-center-invitations').where({
        certificationCenterId: thisCertificationCenterId,
        status: cancelledStatus,
      });
      expect(allCancelledInvitationsOfThisCenter).to.have.lengthOf(2);

      const newlyCancelledInvitations = await knex('certification-center-invitations').where({
        status: cancelledStatus,
        updatedAt: cancelDate,
      });
      expect(newlyCancelledInvitations).to.have.lengthOf(1);

      const acceptedInvitations = await knex('certification-center-invitations').where({
        certificationCenterId: thisCertificationCenterId,
        status: acceptedStatus,
      });
      expect(acceptedInvitations).to.have.lengthOf(1);

      const otherCenterInvitation = await knex('certification-center-invitations')
        .where({
          certificationCenterId: otherCertificationCenterId,
        })
        .first();
      expect(otherCenterInvitation.status).to.equal(pendingStatus);
      expect(otherCenterInvitation.updatedAt).to.deep.equal(previousUpdate);
    });
  });
});
