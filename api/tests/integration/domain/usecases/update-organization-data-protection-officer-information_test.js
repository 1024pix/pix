import { expect, databaseBuilder } from '../../../test-helper.js';
import { DataProtectionOfficer } from '../../../../lib/domain/models/DataProtectionOfficer.js';
import { updateOrganizationDataProtectionOfficerInformation } from '../../../../lib/domain/usecases/update-organization-data-protection-officer-information.js';
import * as dataProtectionOfficerRepository from '../../../../lib/infrastructure/repositories/data-protection-officer-repository.js';

describe('Integration | UseCases | update-organization-data-protection-officer-information', function () {
  it('should add data protection officer information for an organization', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();

    const dataProtectionOfficer = {
      firstName: 'Justin',
      lastName: 'Ptipeu',
      email: 'justin.ptipeu@example.net',
      organizationId,
    };

    // when
    const updatedDataProtectionOfficer = await updateOrganizationDataProtectionOfficerInformation({
      dataProtectionOfficer,
      dataProtectionOfficerRepository,
    });

    // then
    expect(updatedDataProtectionOfficer).to.be.an.instanceOf(DataProtectionOfficer);
    expect(updatedDataProtectionOfficer.id).to.be.a('number');
    expect(updatedDataProtectionOfficer.firstName).to.equal('Justin');
    expect(updatedDataProtectionOfficer.lastName).to.equal('Ptipeu');
    expect(updatedDataProtectionOfficer.email).to.equal('justin.ptipeu@example.net');
    expect(updatedDataProtectionOfficer.organizationId).to.equal(organizationId);
    expect(updatedDataProtectionOfficer.certificationCenterId).to.be.null;
  });

  it('should update organization data protection officer information', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const dataProtectionOfficerToUpdate = databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
      email: 'test@example.net',
      organizationId,
    });
    await databaseBuilder.commit();

    const dataProtectionOfficer = {
      firstName: 'Justin',
      lastName: 'Ptipeu',
      email: 'justin.ptipeu@example.net',
      organizationId,
    };

    // when
    const updatedDataProtectionOfficer = await updateOrganizationDataProtectionOfficerInformation({
      dataProtectionOfficer,
      dataProtectionOfficerRepository,
    });

    // then
    expect(updatedDataProtectionOfficer).to.be.an.instanceOf(DataProtectionOfficer);
    expect(updatedDataProtectionOfficer.id).to.be.a('number').and.to.equal(dataProtectionOfficerToUpdate.id);
    expect(updatedDataProtectionOfficer.firstName).to.equal('Justin');
    expect(updatedDataProtectionOfficer.lastName).to.equal('Ptipeu');
    expect(updatedDataProtectionOfficer.email).to.equal('justin.ptipeu@example.net');
    expect(updatedDataProtectionOfficer.organizationId).to.equal(organizationId);
    expect(updatedDataProtectionOfficer.certificationCenterId).to.be.null;
  });
});
