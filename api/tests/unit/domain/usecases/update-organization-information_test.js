const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { updateOrganizationInformation } = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-organization-information', function() {

  let originalOrganization;
  let organizationRepository;

  beforeEach(function() {
    originalOrganization = domainBuilder.buildOrganization({
      name: 'Old name',
      type: 'SCO',
      logoUrl: 'http://old.logo.url',
      externalId: 'extId',
      provinceCode: '666',
      isManagingStudents: true,
      canCollectProfiles: true,
      email: null,
      credit: null,
    });
    organizationRepository = {
      get: sinon.stub().resolves(originalOrganization),
      update: sinon.stub(),
    };
  });

  context('when organization exists', function() {

    it('should allow to update the organization name (only) if modified', async function() {
      // given
      const newName = 'New name';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        name: newName,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, name: newName });
    });

    it('should allow to update the organization type (only) if modified', async function() {
      // given
      const newType = 'PRO';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        type: newType,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, type: newType });
    });

    it('should allow to update the organization logo URL (only) if modified', async function() {
      // given
      const newLogoUrl = 'http://new.logo.url';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        logoUrl: newLogoUrl,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, logoUrl: newLogoUrl });
    });

    it('should allow to update the organization external id (only) if modified', async function() {
      // given
      const externalId = '9752145V';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        externalId,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, externalId });
    });

    it('should allow to update the organization external id with null value', async function() {
      // given
      const externalId = null;

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        externalId,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, externalId });
    });

    it('should allow to update the organization province code (only) if modified', async function() {
      // given
      const provinceCode = '975';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        provinceCode,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, provinceCode });
    });

    it('should allow to update the organization province code with null value', async function() {
      // given
      const provinceCode = null;

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        provinceCode,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, provinceCode });
    });

    it('should allow to update the organization isManagingStudents (only) if modified', async function() {
      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        isManagingStudents: false,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, isManagingStudents: false });
    });

    it('should allow to update the organization canCollectProfiles (only) if modified', async function() {
      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        canCollectProfiles: false,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, canCollectProfiles: false });
    });

    it('should allow to update the organization email', async function() {
      // given
      const newEmail = 'sco.generic.newaccount@example.net';

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        email: newEmail,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, email: newEmail });
    });

    it('should allow to update the organization credit', async function() {
      // given
      const newCredit = 100;

      // when
      await updateOrganizationInformation({
        id: originalOrganization.id,
        credit: newCredit,
        organizationRepository,
      });

      // then
      expect(organizationRepository.update).to.have.been.calledWithMatch({ ...originalOrganization, credit: newCredit });
    });
  });

  context('when an error occurred', function() {

    it('should reject a NotFoundError (DomainError) when the organization does not exist', async function() {
      // given
      organizationRepository.get = sinon.stub().rejects(new NotFoundError('Not found organization'));

      // when
      const error = await catchErr(updateOrganizationInformation)({
        id: originalOrganization.id,
        logoUrl: 'http://new.logo.url',
        organizationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
