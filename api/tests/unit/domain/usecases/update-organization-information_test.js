const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { updateOrganizationInformation } = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Organization = require('../../../../lib/domain/models/Organization');
const Tag = require('../../../../lib/domain/models/Tag');
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');

describe('Unit | UseCase | update-organization-information', () => {

  let organizationRepository;
  let organizationTagRepository;
  let tagRepository;

  beforeEach(() => {
    organizationRepository = {
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

  context('when organization exists', () => {

    it('should allow to update the organization name (only) if modified', async () => {
      // given
      const newName = 'New name';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        name: newName,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({
        ...originalOrganization,
        name: newName,
      });
    });

    it('should allow to update the organization type (only) if modified', async () => {
      // given
      const newType = 'PRO';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        type: newType,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, type: newType });
    });

    it('should allow to update the organization logo URL (only) if modified', async () => {
      // given
      const newLogoUrl = 'http://new.logo.url';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        logoUrl: newLogoUrl,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, logoUrl: newLogoUrl });
    });

    it('should allow to update the organization external id (only) if modified', async () => {
      // given
      const externalId = '9752145V';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        externalId,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, externalId });
    });

    it('should allow to update the organization external id with null value', async () => {
      // given
      const externalId = null;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        externalId,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, externalId });
    });

    it('should allow to update the organization province code (only) if modified', async () => {
      // given
      const provinceCode = '975';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        provinceCode,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, provinceCode });
    });

    it('should allow to update the organization province code with null value', async () => {
      // given
      const provinceCode = null;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        provinceCode,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, provinceCode });
    });

    it('should allow to update the organization isManagingStudents (only) if modified', async () => {
      // given
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        isManagingStudents: false,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, isManagingStudents: false });
    });

    it('should allow to update the organization canCollectProfiles (only) if modified', async () => {
      // given
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        canCollectProfiles: false,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, canCollectProfiles: false });
    });

    it('should allow to update the organization email', async () => {
      // given
      const newEmail = 'sco.generic.newaccount@example.net';
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        email: newEmail,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, email: newEmail });
    });

    it('should allow to update the organization credit', async () => {
      // given
      const newCredit = 100;
      const organizationId = 7;
      const givenOrganization = _buildOrganizationWithNullAttributes({
        id: organizationId,
        credit: newCredit,
      });
      const originalOrganization = _buildOriginalOrganization(organizationId);

      organizationRepository.get.resolves(originalOrganization);

      // when
      await updateOrganizationInformation({ organization: givenOrganization, organizationRepository });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, credit: newCredit });
    });

    context('when updating tags', () => {

      it('should allow to assign a tag to organization', async () => {
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

        organizationRepository.get.withArgs(organizationId).resolves(originalOrganization);
        tagRepository.get.withArgs(tagToAdd.id).resolves(originalTag);

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationRepository,
          organizationTagRepository,
          tagRepository,
        });

        // given
        const organizationTagToAdd = new OrganizationTag({ organizationId, tagId });
        expect(organizationTagRepository.create).to.have.been.calledWith(organizationTagToAdd);
        expect(organizationTagRepository.delete).to.have.not.been.called;
      });

      it('should allow to unassign a tag to organization', async () => {
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

        organizationRepository.get.withArgs(organizationId).resolves(originalOrganization);
        tagRepository.get.withArgs(originalTag.id).resolves(originalTag);
        organizationTagRepository.findOneByOrganizationIdAndTagId
          .withArgs({ organizationId: originalOrganization.id, tagId: originalTag.id })
          .resolves(organizationTagToRemove);

        // when
        await updateOrganizationInformation({
          organization: givenOrganization,
          organizationRepository,
          organizationTagRepository,
          tagRepository,
        });

        // given
        expect(organizationTagRepository.delete).to.have.been.calledWith({ organizationTagId: organizationTagToRemove.id });
        expect(organizationTagRepository.create).to.have.not.been.called;
      });
    });
  });

  context('when an error occurred', () => {

    it('should reject a NotFoundError (DomainError) when the organization does not exist', async () => {
      // given
      const givenOrganization = _buildOrganizationWithNullAttributes({ id: 8 });
      organizationRepository.get.rejects(new NotFoundError('Not found organization'));

      // when
      const error = await catchErr(updateOrganizationInformation)({
        organization: givenOrganization,
        organizationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});

function _buildOrganizationWithNullAttributes(attributes) {
  return new Organization({
    id: attributes.id,
    name: attributes.name,
    type: attributes.type,
    logoUrl: attributes.logoUrl,
    externalId: attributes.externalId,
    provinceCode: attributes.provinceCode,
    isManagingStudents: attributes.isManagingStudents,
    canCollectProfiles: attributes.canCollectProfiles,
    email: attributes.email,
    credit: attributes.credit,
    tags: attributes.tags,
  });
}

function _buildOriginalOrganization(organizationId) {
  return domainBuilder.buildOrganization({
    id: organizationId,
    name: 'Organization du lycée St Cricq',
    type: 'SCO',
    logoUrl: 'http://old.logo.url',
    externalId: 'extId',
    provinceCode: '666',
    isManagingStudents: true,
    canCollectProfiles: true,
    email: null,
    credit: null,
  });
}
