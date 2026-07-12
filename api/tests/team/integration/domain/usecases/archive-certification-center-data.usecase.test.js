import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Team | Domain | UseCase | archive-certification-center-data', function () {
  describe('#archiveCertificationCenterData', function () {
    it('archives memberships and delete invitations related to a certification center', async function () {
      //given
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

      //when
      await usecases.archiveCertificationCenterData({
        certificationCenterId,
        archiveDate,
        archivedBy: superAdminUser.id,
      });

      //then
      const disabledCertificationCenterMembership = await knex('certification-center-memberships')
        .where({ certificationCenterId })
        .first();

      const certificationCenterInvitation = await knex('certification-center-invitations').where({
        certificationCenterId,
      });

      expect(disabledCertificationCenterMembership.disabledAt).to.deep.equal(archiveDate);
      expect(disabledCertificationCenterMembership.updatedByUserId).to.deep.equal(superAdminUser.id);

      expect(certificationCenterInvitation).to.be.empty;
    });
  });
});
