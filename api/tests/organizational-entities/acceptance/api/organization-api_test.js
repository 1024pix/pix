import * as organizationApi from '../../../../src/organizational-entities/application/api/organization-api.js';
import { OrganizationDTO } from '../../../../src/organizational-entities/application/api/OrganizationDTO.js';
import { databaseBuilder } from '../../../tooling/databases.js';

describe('Acceptance | Organizational Entities | Application | organizations-api', function () {
  it('should return organization by id', async function () {
    //given
    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    // when
    const result = await organizationApi.getOrganization(organization.id);

    // then
    expect(result).to.be.instanceOf(OrganizationDTO);
    expect(result).to.deep.equal({
      id: organization.id,
      name: organization.name,
      type: organization.type,
      logoUrl: organization.logoUrl,
      isManagingStudents: organization.isManagingStudents,
      identityProvider: organization.identityProviderForCampaigns,
    });
  });
});
