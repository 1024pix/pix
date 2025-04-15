import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import {
  databaseBuilder,
  expect,
  insertMultipleSendingFeatureForNewOrganization,
  insertPixJuniorFeatureForNewOrganization,
} from '../../../../test-helper.js';

describe('Integration | UseCases | create-organization', function () {
  let superAdminUserId;

  beforeEach(async function () {
    superAdminUserId = databaseBuilder.factory.buildUser().id;
    await insertMultipleSendingFeatureForNewOrganization();
    await databaseBuilder.commit();
  });

  it('returns newly created organization', async function () {
    // given
    const organization = new OrganizationForAdmin({
      name: 'ACME',
      type: 'PRO',
      documentationUrl: 'https://pix.fr',
      createdBy: superAdminUserId,
    });

    // when
    const createdOrganization = await usecases.createOrganization({ organization });

    // then
    expect(createdOrganization).to.be.instanceOf(OrganizationForAdmin);
    expect(createdOrganization.createdBy).to.be.equal(superAdminUserId);
    expect(createdOrganization.name).to.be.equal(organization.name);
    expect(createdOrganization.type).to.be.equal(organization.type);
    expect(createdOrganization.documentationUrl).to.be.equal(organization.documentationUrl);
    expect(createdOrganization.dataProtectionOfficer.firstName).to.equal('');
    expect(createdOrganization.dataProtectionOfficer.lastName).to.equal('');
    expect(createdOrganization.dataProtectionOfficer.email).to.equal('');
  });

  describe('junior organization', function () {
    it('returns newly created organization', async function () {
      // given
      await insertPixJuniorFeatureForNewOrganization();

      const organization = new OrganizationForAdmin({
        name: 'ACME',
        type: Organization.types.SCO1D,
        documentationUrl: 'https://pix.fr',
        createdBy: superAdminUserId,
      });

      // when
      const createdOrganization = await usecases.createOrganization({ organization });
      // then
      expect(createdOrganization).to.be.instanceOf(OrganizationForAdmin);
      expect(createdOrganization.createdBy).to.be.equal(superAdminUserId);
      expect(createdOrganization.name).to.be.equal(organization.name);
      expect(createdOrganization.type).to.be.equal(organization.type);
      expect(createdOrganization.documentationUrl).to.be.equal(organization.documentationUrl);
      expect(createdOrganization.dataProtectionOfficer.firstName).to.equal('');
      expect(createdOrganization.dataProtectionOfficer.lastName).to.equal('');
      expect(createdOrganization.dataProtectionOfficer.email).to.equal('');
    });
  });
});
