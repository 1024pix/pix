const { expect, sinon, domainBuilder } = require('../../../test-helper');
const updateOrganizationInformation = require('../../../../lib/domain/usecases/update-organization-information');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-organization-information', () => {

  let originalOrganization;
  let organizationRepository;

  beforeEach(() => {
    originalOrganization = domainBuilder.buildOrganization({
      name: 'Old name',
      type: 'SCO',
      logoUrl: 'http://old.logo.url',
    });
    organizationRepository = {
      get: sinon.stub().resolves(originalOrganization),
      update: sinon.stub().callsFake((modifiedOrganization) => modifiedOrganization)
    };
  });

  context('when organization exists', () => {

    it('should allow to update the organization name (only) if modified', () => {
      // given
      const newName = 'New name';

      // when
      const promise = updateOrganizationInformation({
        id: originalOrganization.id,
        name: newName,
        organizationRepository
      });

      // then
      return promise.then((resultOrganization) => {
        expect(resultOrganization.name).to.equal(newName);
        expect(resultOrganization.type).to.equal(originalOrganization.type);
        expect(resultOrganization.logoUrl).to.equal(originalOrganization.logoUrl);
      });
    });

    it('should allow to update the organization type (only) if modified', () => {
      // given
      const newType = 'PRO';

      // when
      const promise = updateOrganizationInformation({
        id: originalOrganization.id,
        type: newType,
        organizationRepository
      });

      // then
      return promise.then((resultOrganization) => {
        expect(resultOrganization.name).to.equal(originalOrganization.name);
        expect(resultOrganization.type).to.equal(newType);
        expect(resultOrganization.logoUrl).to.equal(originalOrganization.logoUrl);
      });
    });

    it('should allow to update the organization logo URL (only) if modified', () => {
      // given
      const newLogoUrl = 'http://new.logo.url';

      // when
      const promise = updateOrganizationInformation({
        id: originalOrganization.id,
        logoUrl: newLogoUrl,
        organizationRepository
      });

      // then
      return promise.then((resultOrganization) => {
        expect(resultOrganization.logoUrl).to.equal(newLogoUrl);

        expect(resultOrganization.name).to.equal(originalOrganization.name);
        expect(resultOrganization.type).to.equal(originalOrganization.type);
        expect(resultOrganization.logoUrl).to.equal(newLogoUrl);
      });
    });
  });

  context('when an error occurred', () => {

    it('should reject a NotFoundError (DomainError) when the organization does not exist', () => {
      // given
      const error = new NotFoundError('Not found organization');
      organizationRepository.get = sinon.stub().rejects(error);

      // when
      const promise = updateOrganizationInformation({
        id: originalOrganization.id,
        logoUrl: 'http://new.logo.url',
        organizationRepository
      });

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

});
