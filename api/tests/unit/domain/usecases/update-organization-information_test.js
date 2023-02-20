import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { updateOrganizationInformation } from '../../../../lib/domain/usecases';
import { NotFoundError } from '../../../../lib/domain/errors';
import Tag from '../../../../lib/domain/models/Tag';
import OrganizationTag from '../../../../lib/domain/models/OrganizationTag';
import OrganizationForAdmin from '../../../../lib/domain/models/OrganizationForAdmin';
import OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers';

describe('Unit | UseCase | update-organization-information', function () {
  let dataProtectionOfficerRepository;
  let organizationForAdminRepository;
  let organizationTagRepository;
  let tagRepository;

  beforeEach(function () {
    dataProtectionOfficerRepository = {
      create: sinon.stub(),
      get: sinon.stub(),
      update: sinon.stub(),
    };
    organizationForAdminRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    organizationTagRepository = {
      create: sinon.stub(),
      delete: sinon.stub(),
      findOneByOrganizationIdAndTagId: sinon.stub(),
    };
    tagRepository = {
      get: sinon.stub(),
    };
  });

  context('when organization exists', function () {
    it('should allow to update the organization name (only) if modified', async function () {
      // given
      const newName = 'New name';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        name: newName,
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.service.code,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        name: newName,
        identityProviderForCampaigns: OidcIdentityProviders.CNAV.service.code,
      });
    });

    it('should allow to update the organization type (only) if modified', async function () {
      // given
      const newType = 'PRO';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        type: newType,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        type: newType,
      });
    });

    it('should allow to update the organization logo URL (only) if modified', async function () {
      // given
      const newLogoUrl = 'http://new.logo.url';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        logoUrl: newLogoUrl,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        logoUrl: newLogoUrl,
      });
    });

    it('should allow to update the organization external id (only) if modified', async function () {
      // given
      const externalId = '9752145V';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        externalId,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        externalId,
      });
    });

    it('should allow to update the organization external id with null value', async function () {
      // given
      const externalId = null;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        externalId,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        externalId,
      });
    });

    it('should allow to update the organization province code (only) if modified', async function () {
      // given
      const provinceCode = '975';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        provinceCode,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        provinceCode,
      });
    });

    it('should allow to update the organization province code with null value', async function () {
      // given
      const provinceCode = null;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        provinceCode,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        provinceCode,
      });
    });

    it('should allow to update the organization isManagingStudents (only) if modified', async function () {
      // given
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        isManagingStudents: false,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        isManagingStudents: false,
      });
    });

    it('should allow to update the organization email', async function () {
      // given
      const newEmail = 'sco.generic.newaccount@example.net';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        email: newEmail,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        email: newEmail,
      });
    });

    it('should allow to update the organization credit', async function () {
      // given
      const newCredit = 100;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        credit: newCredit,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        credit: newCredit,
      });
    });

    it('should allow to update the organization documentationUrl', async function () {
      // given
      const newDocumentationUrl = 'https://pix.fr/';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        documentationUrl: newDocumentationUrl,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        documentationUrl: newDocumentationUrl,
      });
    });

    it('should allow to update the organization showSkills flag', async function () {
      // given
      const newShowSkills = true;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        showSkills: newShowSkills,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationForAdminRepository.get.resolves(originalOrganization);
      organizationForAdminRepository.update.resolves({});
      dataProtectionOfficerRepository.get.resolves({});
      dataProtectionOfficerRepository.update.resolves({});

      // when
      await updateOrganizationInformation({
        organization: givenOrganization,
        organizationForAdminRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(organizationForAdminRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        showSkills: newShowSkills,
      });
    });

    context('when updating tags', function () {
      it('should allow to assign a tag to organization', async function () {
        // given
        const organizationId = 7;
        const tagId = 4;
        const tagToAdd = new Tag({ id: tagId });
        const givenOrganization = _buildOrganizationWithNullAttributes({
          id: organizationId,
          tags: [tagToAdd],
        });

        const originalOrganization = _buildOriginalOrganization(organizationId);
        const originalTag = domainBuilder.buildTag({ id: tagId, name: 'SCO' });

        organizationForAdminRepository.get.withArgs(organizationId).resolves(originalOrganization);
        tagRepository.get.withArgs(tagToAdd.id).resolves(originalTag);
        organizationForAdminRepository.update.resolves({});
        dataProtectionOfficerRepository.get.resolves({});
        dataProtectionOfficerRepository.update.resolves({});

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationForAdminRepository,
          organizationTagRepository,
          tagRepository,
          dataProtectionOfficerRepository,
        });

        // given
        const organizationTagToAdd = new OrganizationTag({ organizationId, tagId });
        expect(organizationTagRepository.create).to.have.been.calledWith(organizationTagToAdd);
        expect(organizationTagRepository.delete).to.have.not.been.called;
      });

      it('should allow to unassign a tag to organization', async function () {
        // given
        const organizationId = 7;
        const givenOrganization = _buildOrganizationWithNullAttributes({
          id: organizationId,
          tags: [],
        });

        const originalTag = domainBuilder.buildTag({ id: 4, name: 'SCO' });
        const originalOrganization = domainBuilder.buildOrganization({
          id: organizationId,
          tags: [originalTag],
        });
        const organizationTagToRemove = domainBuilder.buildOrganizationTag({
          organizationId: originalOrganization.id,
          tagId: originalTag.id,
        });

        organizationForAdminRepository.get.withArgs(organizationId).resolves(originalOrganization);
        tagRepository.get.withArgs(originalTag.id).resolves(originalTag);
        organizationTagRepository.findOneByOrganizationIdAndTagId
          .withArgs({ organizationId: originalOrganization.id, tagId: originalTag.id })
          .resolves(organizationTagToRemove);
        organizationForAdminRepository.update.resolves({});
        dataProtectionOfficerRepository.get.resolves({});
        dataProtectionOfficerRepository.update.resolves({});

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationForAdminRepository,
          organizationTagRepository,
          tagRepository,
          dataProtectionOfficerRepository,
        });

        // given
        expect(organizationTagRepository.delete).to.have.been.calledWith({
          organizationTagId: organizationTagToRemove.id,
        });
        expect(organizationTagRepository.create).to.have.not.been.called;
      });
    });

    context('when a data protection officer is linked to this organization', function () {
      it('should allow to update the data protection officer information', async function () {
        // given
        const givenOrganization = {
          id: 7,
          dataProtectionOfficerFirstName: 'Infinite',
          dataProtectionOfficerLastName: 'Blossom',
          dataProtectionOfficerEmail: 'karasu.nogymx@example.net',
        };

        organizationForAdminRepository.get.resolves({ id: 7 });
        organizationForAdminRepository.update.resolves({ id: 7 });
        dataProtectionOfficerRepository.get.resolves({ id: 1 });
        dataProtectionOfficerRepository.update.resolves({
          id: 1,
          firstName: 'Infinite',
          lastName: 'Blossom',
          email: 'karasu.nogymx@example.net',
          organizationId: 7,
        });

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationForAdminRepository,
          dataProtectionOfficerRepository,
        });

        // then
        expect(dataProtectionOfficerRepository.update).to.have.been.calledWithMatch({
          firstName: 'Infinite',
          lastName: 'Blossom',
          email: 'karasu.nogymx@example.net',
        });
      });
    });

    context('when a data protection officer is not linked to this organization', function () {
      it('should allow to create a data protection officer', async function () {
        // given
        const givenOrganization = {
          id: 7,
          dataProtectionOfficerFirstName: 'Infinite',
          dataProtectionOfficerLastName: 'Blossom',
          dataProtectionOfficerEmail: 'karasu.nogymx@example.net',
        };

        organizationForAdminRepository.get.resolves({ id: 7 });
        organizationForAdminRepository.update.resolves({ id: 7 });
        dataProtectionOfficerRepository.get.resolves(null);
        dataProtectionOfficerRepository.create.resolves({
          id: 1,
          firstName: 'Infinite',
          lastName: 'Blossom',
          email: 'karasu.nogymx@example.net',
        });

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationForAdminRepository,
          dataProtectionOfficerRepository,
        });

        // then
        expect(dataProtectionOfficerRepository.create).to.have.been.calledWithMatch({
          firstName: 'Infinite',
          lastName: 'Blossom',
          email: 'karasu.nogymx@example.net',
        });
      });
    });
  });

  context('when an error occurred', function () {
    it('should reject a NotFoundError (DomainError) when the organization does not exist', async function () {
      // given
      const givenOrganization = _buildOrganizationWithNullAttributes({ id: 8 });
      organizationForAdminRepository.get.rejects(new NotFoundError('Not found organization'));

      // when
      const error = await catchErr(updateOrganizationInformation)({
        organization: givenOrganization,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});

function _buildOrganizationWithNullAttributes(attributes) {
  return new OrganizationForAdmin({
    id: attributes.id,
    name: attributes.name,
    type: attributes.type,
    logoUrl: attributes.logoUrl,
    externalId: attributes.externalId,
    provinceCode: attributes.provinceCode,
    isManagingStudents: attributes.isManagingStudents,
    email: attributes.email,
    credit: attributes.credit,
    tags: attributes.tags,
    documentationUrl: attributes.documentationUrl,
    showSkills: attributes.showSkills,
    identityProviderForCampaigns: attributes.identityProviderForCampaigns,
  });
}

function _buildOriginalOrganization(organizationId) {
  return domainBuilder.buildOrganizationForAdmin({
    id: organizationId,
    name: 'Organization du lycée St Cricq',
    type: 'SCO',
    logoUrl: 'http://old.logo.url',
    externalId: 'extId',
    provinceCode: '666',
    isManagingStudents: true,
    email: null,
    credit: null,
  });
}
