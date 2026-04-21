import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational Entities | Domain | UseCase | get-organization-details', function () {
  it('should return the Organization matching the given organization ID', async function () {
    // given
    const dateNow = new Date();
    const country = databaseBuilder.factory.buildCertificationCpfCountry({
      code: 99100,
      commonName: 'France',
      originalName: 'France',
    });
    const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    const organization = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      name: 'Organization of the dark side',
      logoUrl: 'some logo url',
      credit: 154,
      externalId: '100',
      provinceCode: '75',
      isManagingStudents: 'true',
      email: 'sco.generic.account@example.net',
      documentationUrl: 'https://pix.fr/',
      createdBy: superAdmin.id,
      createdAt: dateNow,
      showNPS: true,
      formNPSUrl: 'https://pix.fr/',
      showSkills: false,
      identityProviderForCampaigns: 'genericOidcProviderCode',
    });

    await databaseBuilder.commit();

    // when
    const foundOrganization = await usecases.getOrganizationDetails({ organizationId: organization.id });

    // then
    expect(foundOrganization).to.be.instanceOf(OrganizationForAdmin);
    expect(foundOrganization.id).to.equal(organization.id);
    expect(foundOrganization.countryName).to.equal(country.commonName);
  });

  context('when country is not found', function () {
    it('should return the Organization without country name', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Organization of the dark side',
        externalId: '100',
        countryCode: 99999,
        createdBy: superAdmin.id,
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getOrganizationDetails({ organizationId: organization.id });

      // then
      expect(result.countryName).to.be.undefined;
    });
  });

  context('when the organization is a SCO-1D type', function () {
    it('should return the code for the given organizationId', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organization = databaseBuilder.factory.buildOrganization({
        type: 'SCO-1D',
        name: 'Organization of the dark side',
        externalId: '100',
        createdBy: superAdmin.id,
      });

      databaseBuilder.factory.buildSchool({
        organizationId: organization.id,
        code: 'SCO-1D-CODE-1234',
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getOrganizationDetails({ organizationId: organization.id });

      // then
      expect(result.code).to.equal('SCO-1D-CODE-1234');
    });
  });
});
