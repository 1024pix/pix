import sinon from 'sinon';

import { ArchiveOrganizationsInBatchError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | archive-organizations-in-batch', function () {
  let now, clock;

  beforeEach(function () {
    now = new Date('2025-01-01');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('success', function () {
    it('archives the organizations properly', async function () {
      // given
      const organization1 = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization1.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization1.id,
        archivedAt: null,
      });
      databaseBuilder.factory.buildMembership({
        organizationId: organization1.id,
        disabledAt: null,
      });

      const organization2 = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization2.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization2.id,
        archivedAt: null,
      });
      databaseBuilder.factory.buildMembership({
        organizationId: organization2.id,
        disabledAt: null,
      });

      const user = databaseBuilder.factory.buildUser.withRole();

      const organizationIds = [organization1.id, organization2.id];

      await databaseBuilder.commit();

      // when
      await usecases.archiveOrganizationsInBatch({
        organizationIds,
        userId: user.id,
      });

      // then
      await _assertOrganizationIsArchived({ archivedOrganizationId: organization1.id, user, archivedAt: now });
      await _assertInvitationsAreDeleted({
        archivedOrganizationId: organization1.id,
      });
      await _assertCampaignAreDeleted({ organizationId: organization1.id, archivedAt: now });
      await _assertMembershipAreDisabled({ organizationId: organization1.id, disabledAt: now });

      await _assertOrganizationIsArchived({ archivedOrganizationId: organization2.id, user, archivedAt: now });
      await _assertInvitationsAreDeleted({
        archivedOrganizationId: organization2.id,
      });
      await _assertCampaignAreDeleted({ organizationId: organization2.id, archivedAt: now });
      await _assertMembershipAreDisabled({ organizationId: organization2.id, disabledAt: now });
    });
  });

  context('failure', function () {
    it('processes until it throws an error if one of the organizations cannot be archived', async function () {
      // given
      const nonExistingOrganizationId = 1234;
      const organization1 = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization1.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization1.id,
        archivedAt: null,
      });
      databaseBuilder.factory.buildMembership({
        organizationId: organization1.id,
        disabledAt: null,
      });

      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      const organizationIds = [organization1.id, nonExistingOrganizationId];

      // when
      const error = await catchErr(usecases.archiveOrganizationsInBatch)({
        organizationIds,
        userId: user.id,
      });

      // then
      expect(error).to.deepEqualInstance(
        new ArchiveOrganizationsInBatchError({
          meta: {
            currentLine: 2,
            totalLines: 2,
          },
        }),
      );
      await _assertOrganizationIsArchived({ archivedOrganizationId: organization1.id, user, archivedAt: now });
      await _assertInvitationsAreDeleted({
        archivedOrganizationId: organization1.id,
      });
      await _assertCampaignAreDeleted({ organizationId: organization1.id, archivedAt: now });
      await _assertMembershipAreDisabled({ organizationId: organization1.id, disabledAt: now });
    });
  });
});

async function _assertMembershipAreDisabled({ organizationId, disabledAt }) {
  const archivedMembership1 = await knex('memberships').where({ organizationId }).first();

  expect(archivedMembership1.disabledAt).to.deep.equal(disabledAt);
}

async function _assertCampaignAreDeleted({ organizationId, archivedAt }) {
  const archivedCampaign1 = await knex('campaigns').where({ organizationId }).first();
  expect(archivedCampaign1.deletedAt).to.deep.equal(archivedAt);
}

async function _assertInvitationsAreDeleted({ archivedOrganizationId }) {
  const archivedOrganizationInvitations = await knex('organization-invitations').where({
    organizationId: archivedOrganizationId,
  });

  expect(archivedOrganizationInvitations).to.be.empty;
}

async function _assertOrganizationIsArchived({ archivedOrganizationId, user, archivedAt }) {
  const archivedOrganization = await knex('organizations').where({ id: archivedOrganizationId }).first();

  expect(archivedOrganization.archivedBy).to.deep.equal(user.id);
  expect(archivedOrganization.archivedAt).to.deep.equal(archivedAt);
}
