import { certificationCenterApiRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-api.repository.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

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
      await certificationCenterApiRepository.archiveCertificationCenterData({
        certificationCenterId,
        archiveDate,
        archivedBy: superAdminUser.id,
      });

      // then
      const disabledCertificationCenterMembership = await knex('certification-center-memberships')
        .where({ certificationCenterId })
        .first();
      const deletedCertificationCenterInvitation = await knex('certification-center-invitations').where({
        certificationCenterId,
      });

      expect(disabledCertificationCenterMembership.disabledAt).to.deep.equal(archiveDate);
      expect(disabledCertificationCenterMembership.updatedByUserId).to.deep.equal(superAdminUser.id);

      expect(deletedCertificationCenterInvitation).to.be.empty;
    });
  });
});
