import { catchErr, expect, sinon } from '../../../test-helper.js';

import { setCertificationCenterMembershipRoleToAdmin } from '../../../../lib/domain/usecases/set-certification-center-membership-role-to-admin.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | UseCases | set-certification-center-memberships-role-to-admin', function () {
  let certificationCenterMembershipRepository, clock;
  const now = new Date();

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    certificationCenterMembershipRepository = {
      findOneWithCertificationCenterIdAndUserId: sinon.stub(),
      update: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when certification center membership exists', function () {
    it('updates certification center memberships role to admin', async function () {
      // given
      const certificationCenterId = 1;
      const userId = 1;
      const certificationCenterMembership = new CertificationCenterMembership({
        id: 1,
        role: 'MEMBER',
      });
      const updatedCertificationCenterMembership = new CertificationCenterMembership({
        ...certificationCenterMembership,
        updatedAt: now,
        role: 'ADMIN',
      });

      certificationCenterMembershipRepository.findOneWithCertificationCenterIdAndUserId
        .withArgs({
          certificationCenterId,
          userId,
        })
        .resolves(certificationCenterMembership);
      certificationCenterMembershipRepository.update.withArgs(updatedCertificationCenterMembership).resolves();

      // when
      await setCertificationCenterMembershipRoleToAdmin({
        certificationCenterId,
        userId,
        certificationCenterMembershipRepository,
      });

      // then
      expect(certificationCenterMembershipRepository.findOneWithCertificationCenterIdAndUserId).to.have.been.called;
      expect(certificationCenterMembershipRepository.update).to.have.been.called;
    });
  });

  context('when certification center membership does not exist', function () {
    it('throws a NotFound error', async function () {
      // given
      const certificationCenterId = 1;
      const userId = 1;

      certificationCenterMembershipRepository.findOneWithCertificationCenterIdAndUserId
        .withArgs({
          certificationCenterId,
          userId,
        })
        .resolves();

      // when
      const error = await catchErr(setCertificationCenterMembershipRoleToAdmin)({
        certificationCenterId,
        userId,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        `Certification center membership not found with certificationCenterId(${certificationCenterId}) and userId(${userId})`,
      );
    });
  });
});
