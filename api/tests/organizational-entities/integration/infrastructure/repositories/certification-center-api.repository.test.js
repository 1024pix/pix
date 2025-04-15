import { repositories } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repositories | certification-center-api', function () {
  describe('#archiveCertificationCenterData', function () {
    it('archives memberships and invitations related to a certification center', async function () {
      // given
      const archiveDate = new Date(2023, 3, 14);
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const user = databaseBuilder.factory.buildUser();
      const superAdminUser = databaseBuilder.factory.buildUser();

      const pendingStatus = CertificationCenterInvitation.StatusType.PENDING;

      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 1,
        certificationCenterId,
        status: pendingStatus,
      });

      await databaseBuilder.commit();

      // when
      await repositories.certificationCenterApiRepository.archiveCertificationCenterData({
        certificationCenterId,
        archiveDate,
        archivedBy: superAdminUser.id,
      });

      // then
      const disabledCertificationCenterMembership = await knex('certification-center-memberships')
        .where({ certificationCenterId })
        .first();
      const cancelledCertificationCenterInvitation = await knex('certification-center-invitations')
        .where({ certificationCenterId })
        .first();

      expect(disabledCertificationCenterMembership.disabledAt).to.deep.equal(archiveDate);
      expect(disabledCertificationCenterMembership.updatedByUserId).to.deep.equal(superAdminUser.id);

      expect(cancelledCertificationCenterInvitation.status).to.deep.equal('cancelled');
      expect(cancelledCertificationCenterInvitation.updatedAt).to.deep.equal(archiveDate);
    });
  });
});
