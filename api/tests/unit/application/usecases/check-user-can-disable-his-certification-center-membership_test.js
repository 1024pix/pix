import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import * as checkUserCanDisableHisCertificationCenterMembership from '../../../../lib/application/usecases/check-user-can-disable-his-certification-center-membership.js';

describe('Unit | Application | UseCases | check-user-can-disable-his-certification-center-membership', function () {
  let certificationCenterMembershipRepository;

  beforeEach(function () {
    certificationCenterMembershipRepository = {
      findActiveAdminsByCertificationCenterId: sinon.stub(),
    };
  });

  context('when there is at least one administrator left', function () {
    it('returns "true"', async function () {
      // given
      const userId = 1;
      const certificationCenterId = 1;
      const firstAdmin = domainBuilder.buildCertificationCenterMembership({
        id: 1,
        role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
        user: domainBuilder.buildUser({ id: 1 }),
      });
      const secondAdmin = domainBuilder.buildCertificationCenterMembership({
        id: 2,
        role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
        user: domainBuilder.buildUser({ id: 2 }),
      });

      certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId.resolves([
        firstAdmin,
        secondAdmin,
      ]);

      // when
      const canDisableHisCertificationCenterMembership =
        await checkUserCanDisableHisCertificationCenterMembership.execute({
          certificationCenterId,
          userId,
          dependencies: { certificationCenterMembershipRepository },
        });

      // then
      expect(canDisableHisCertificationCenterMembership).to.be.true;
    });
  });

  context('when there is no administrator left', function () {
    it('returns "false"', async function () {
      // given
      const userId = 1;
      const organizationId = 1;
      const admin = domainBuilder.buildCertificationCenterMembership({
        id: 1,
        role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
        user: domainBuilder.buildUser({ id: 1 }),
      });

      certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId.resolves([admin]);

      // when
      const canDisableHisCertificationCenterMembership =
        await checkUserCanDisableHisCertificationCenterMembership.execute({
          organizationId,
          userId,
          dependencies: { certificationCenterMembershipRepository },
        });

      // then
      expect(canDisableHisCertificationCenterMembership).to.be.false;
    });
  });
});
