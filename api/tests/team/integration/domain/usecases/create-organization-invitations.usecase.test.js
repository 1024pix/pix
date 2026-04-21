import { OrganizationArchivedError } from '../../../../../src/team/domain/errors.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Team | Domain | UseCase | create-organization-invitations', function () {
  it('creates multiple organizationInvitations with trimmed and deduplicated emails', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    const emails = ['member01@organization.org', '   member01@organization.org', 'member02@organization.org'];
    const locale = 'fr-fr';

    // when
    await usecases.createOrganizationInvitations({
      organizationId,
      emails,
      locale,
    });

    // then
    const organizationInvitations = await knex('organization-invitations');
    expect(organizationInvitations).to.have.lengthOf(2);
    const organizationInvitationMap = Object.fromEntries(
      organizationInvitations.map((organizationInvitation) => {
        return [organizationInvitation.email, organizationInvitation];
      }),
    );
    const organizationInvitation1 = organizationInvitationMap['member01@organization.org'];
    expect(organizationInvitation1).to.deep.include({ locale, role: null });

    const organizationInvitation2 = organizationInvitationMap['member02@organization.org'];
    expect(organizationInvitation2).to.deep.include({ locale, role: null });
  });

  context('when the organization is archived', function () {
    it('throws an OrganizationArchivedError', async function () {
      // given
      const archivedBy = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ archivedAt: '2022-02-02', archivedBy }).id;
      await databaseBuilder.commit();

      const emails = ['member@organization.org'];
      const locale = 'fr-fr';

      // when
      const error = await catchErr(usecases.createOrganizationInvitations)({
        organizationId,
        emails,
        locale,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationArchivedError);
    });
  });
});
