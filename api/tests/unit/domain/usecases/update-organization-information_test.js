const { expect, sinon, factory } = require('../../../test-helper');
const _ = require('lodash');
const updateOrganizationInformation = require('../../../../lib/domain/usecases/update-organization-information');

describe('Unit | UseCase | update-organization-information', () => {

  context('when organization exists', () => {

    let originalOrganization;
    let organizationRepository;

    beforeEach(() => {
      originalOrganization = factory.buildOrganization({
        name: 'Old name',
        type: 'SCO',
        logoUrl: 'http://old.logo.url',
      });
      organizationRepository = {
        get: sinon.stub().resolves(originalOrganization),
        update: sinon.stub().callsFake((modifiedOrganization) => modifiedOrganization)
      };
    });

    it('should allow to update the organization name (only) if modified', () => {
      // given
      const newName = 'New name';

      // when
      const promise = updateOrganizationInformation({ id: originalOrganization.id, name: newName, organizationRepository });

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
      const promise = updateOrganizationInformation({ id: originalOrganization.id, type: newType, organizationRepository });

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
      const promise = updateOrganizationInformation({ id: originalOrganization.id, logoUrl: newLogoUrl, organizationRepository });

      // then
      return promise.then((resultOrganization) => {
        expect(resultOrganization.logoUrl).to.equal(newLogoUrl);

        expect(resultOrganization.name).to.equal(originalOrganization.name);
        expect(resultOrganization.type).to.equal(originalOrganization.type);
        expect(resultOrganization.logoUrl).to.equal(newLogoUrl);
      });
    });
  });
});
