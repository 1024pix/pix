import { OrganizationArchivedError } from '../../../../../lib/domain/errors.js';
import { createOrganizationInvitations } from '../../../../../src/team/domain/usecases/create-organization-invitations.usecase.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | UseCase | create-organization-invitations', function () {
  let organizationInvitationRepository, organizationRepository, organizationInvitationService;

  beforeEach(function () {
    const organization = domainBuilder.buildOrganization();
    organizationRepository = {
      get: sinon.stub(),
    };
    organizationRepository.get.resolves(organization);

    organizationInvitationService = {
      createOrUpdateOrganizationInvitation: sinon.stub(),
    };
    organizationInvitationService.createOrUpdateOrganizationInvitation.resolves();
  });

  describe('#createOrganizationInvitations', function () {
    it('should create one organization-invitation with organizationId and email', async function () {
      // given
      const organizationId = 1;
      const emails = ['member@organization.org'];
      const locale = 'fr-fr';

      // when
      await createOrganizationInvitations({
        organizationId,
        emails,
        locale,
        organizationRepository,
        organizationInvitationRepository,
        organizationInvitationService,
      });

      // then
      expect(organizationInvitationService.createOrUpdateOrganizationInvitation).to.has.been.calledOnce;
      expect(organizationInvitationService.createOrUpdateOrganizationInvitation).to.has.been.calledWithExactly({
        organizationId,
        email: emails[0],
        locale,
        organizationRepository,
        organizationInvitationRepository,
      });
    });

    it('should delete spaces and duplicated emails, and create two organization-invitations', async function () {
      // given
      const organizationId = 2;
      const emails = ['member01@organization.org', '   member01@organization.org', 'member02@organization.org'];

      // when
      await createOrganizationInvitations({
        organizationId,
        emails,
        organizationRepository,
        organizationInvitationRepository,
        organizationInvitationService,
      });

      // then
      expect(organizationInvitationService.createOrUpdateOrganizationInvitation).to.has.been.calledTwice;
    });

    it('should throw an organization archived error when it is archived', async function () {
      // given
      const archivedOrganization = domainBuilder.buildOrganization({ archivedAt: '2022-02-02' });
      const emails = ['member01@organization.org'];
      organizationRepository.get.resolves(archivedOrganization);

      // when
      const error = await catchErr(createOrganizationInvitations)({
        organizationId: archivedOrganization.id,
        emails,
        organizationRepository,
        organizationInvitationRepository,
        organizationInvitationService,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationArchivedError);
      expect(error.message).to.be.equal("L'organisation est archivée.");
      expect(organizationInvitationService.createOrUpdateOrganizationInvitation).to.not.have.been.called;
    });
  });
});
