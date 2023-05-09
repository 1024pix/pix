import { expect, databaseBuilder, knex } from '../../../test-helper.js';

import * as organizationForAdminRepository from '../../../../lib/infrastructure/repositories/organization-for-admin-repository.js';
import * as dataProtectionOfficerRepository from '../../../../lib/infrastructure/repositories/data-protection-officer-repository.js';
import { OrganizationForAdmin } from '../../../../lib/domain/models/organizations-administration/Organization.js';
import * as organizationCreationValidator from '../../../../lib/domain/validators/organization-creation-validator.js';
import { createOrganization } from '../../../../lib/domain/usecases/create-organization.js';

describe('Integration | UseCases | create-organization', function () {
  afterEach(async function () {
    await knex('data-protection-officers').delete();
    await knex('organizations').delete();
  });

  it('returns newly created organization', async function () {
    // given
    const superAdminUserId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    const organization = new OrganizationForAdmin({
      name: 'ACME',
      type: 'PRO',
      documentationUrl: 'https://pix.fr',
      createdBy: superAdminUserId,
    });

    // when
    const createdOrganization = await createOrganization({
      organization,
      dataProtectionOfficerRepository,
      organizationForAdminRepository,
      organizationCreationValidator,
    });

    // then
    expect(createdOrganization).to.be.instanceOf(OrganizationForAdmin);
    expect(createdOrganization.createdBy).to.be.equal(superAdminUserId);
    expect(createdOrganization.name).to.be.equal(organization.name);
    expect(createdOrganization.type).to.be.equal(organization.type);
    expect(createdOrganization.documentationUrl).to.be.equal(organization.documentationUrl);
    expect(createdOrganization.dataProtectionOfficerFirstName).to.be.null;
    expect(createdOrganization.dataProtectionOfficerLastName).to.be.null;
    expect(createdOrganization.dataProtectionOfficerEmail).to.be.null;
  });
});
