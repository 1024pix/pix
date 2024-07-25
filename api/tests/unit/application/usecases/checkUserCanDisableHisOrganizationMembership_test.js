import * as checkUserCanDisableHisOrganizationMembership from '../../../../lib/application/usecases/checkUserCanDisableHisOrganizationMembership.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Application | UseCases | checkUserCanDisableHisOrganizationMembership', function () {
  let membershipRepository;

  beforeEach(function () {
    membershipRepository = {
      findAdminsByOrganizationId: sinon.stub(),
    };
  });

  context('when there is at least one administrator left', function () {
    it('returns "true"', async function () {
      // given
      const userId = 1;
      const organizationId = 1;
      const firstAdmin = domainBuilder.buildMembership({
        id: 1,
        organizationRole: Membership.roles.ADMIN,
        user: domainBuilder.buildUser({ id: 1 }),
      });
      const secondAdmin = domainBuilder.buildMembership({
        id: 2,
        organizationRole: Membership.roles.ADMIN,
        user: domainBuilder.buildUser({ id: 2 }),
      });
      membershipRepository.findAdminsByOrganizationId.resolves([firstAdmin, secondAdmin]);

      // when
      const canDisableHisOrganizationMembership = await checkUserCanDisableHisOrganizationMembership.execute({
        organizationId,
        userId,
        dependencies: { membershipRepository },
      });

      // then
      expect(canDisableHisOrganizationMembership).to.be.true;
    });
  });

  context('when there is no administrator left', function () {
    it('returns "false"', async function () {
      // given
      const userId = 1;
      const organizationId = 1;
      const admin = domainBuilder.buildMembership({
        id: 1,
        organizationRole: Membership.roles.ADMIN,
        user: domainBuilder.buildUser({ id: 1 }),
      });
      membershipRepository.findAdminsByOrganizationId.resolves([admin]);

      // when
      const canDisableHisOrganizationMembership = await checkUserCanDisableHisOrganizationMembership.execute({
        organizationId,
        userId,
        dependencies: { membershipRepository },
      });

      // then
      expect(canDisableHisOrganizationMembership).to.be.false;
    });
  });
});
