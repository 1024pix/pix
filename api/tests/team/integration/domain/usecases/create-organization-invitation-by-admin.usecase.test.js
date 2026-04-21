import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { OrganizationArchivedError } from '../../../../../src/team/domain/errors.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Team | Domain | UseCase | create-organization-invitation-by-admin', function () {
  it('creates an organizationInvitation', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    const email = 'member@organization.org';
    const locale = 'fr-fr';
    const role = Membership.roles.MEMBER;

    // when
    await usecases.createOrganizationInvitationByAdmin({
      organizationId,
      email,
      locale,
      role,
    });

    // then
    const organizationInvitations = await knex('organization-invitations');
    expect(organizationInvitations).to.have.lengthOf(1);
    const organizationInvitation = organizationInvitations[0];
    expect(organizationInvitation).to.deep.include({ email, locale, role });
  });

  context('when the organization is archived', function () {
    it('throws an OrganizationArchivedError', async function () {
      // given
      const archivedBy = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ archivedAt: '2022-02-02', archivedBy }).id;
      await databaseBuilder.commit();

      const email = 'member@organization.org';
      const locale = 'fr-fr';
      const role = Membership.roles.MEMBER;

      // when
      const error = await catchErr(usecases.createOrganizationInvitationByAdmin)({
        organizationId,
        email,
        locale,
        role,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationArchivedError);
    });
  });
});
