import { expect, databaseBuilder } from '../../../test-helper.js';
import { DataProtectionOfficer } from '../../../../lib/domain/models/DataProtectionOfficer.js';
import { updateCertificationCenterDataProtectionOfficerInformation } from '../../../../lib/domain/usecases/update-certification-center-data-protection-officer-information.js';
import * as dataProtectionOfficerRepository from '../../../../lib/infrastructure/repositories/data-protection-officer-repository.js';

describe('Integration | UseCases | update-certification-center-data-protection-officer-information', function () {
  it('should add data protection officer information for a certification center', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    await databaseBuilder.commit();

    const dataProtectionOfficer = {
      firstName: 'Justin',
      lastName: 'Ptipeu',
      email: 'justin.ptipeu@example.net',
      certificationCenterId,
    };

    // when
    const updatedDataProtectionOfficer = await updateCertificationCenterDataProtectionOfficerInformation({
      dataProtectionOfficer,
      dataProtectionOfficerRepository,
    });

    // then
    expect(updatedDataProtectionOfficer).to.be.an.instanceOf(DataProtectionOfficer);
    expect(updatedDataProtectionOfficer.id).to.be.a('number');
    expect(updatedDataProtectionOfficer.firstName).to.equal('Justin');
    expect(updatedDataProtectionOfficer.lastName).to.equal('Ptipeu');
    expect(updatedDataProtectionOfficer.email).to.equal('justin.ptipeu@example.net');
    expect(updatedDataProtectionOfficer.certificationCenterId).to.equal(certificationCenterId);
    expect(updatedDataProtectionOfficer.organizationId).to.be.null;
  });

  it('should update certification center data protection officer information', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    const dataProtectionOfficerToUpdate = databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
      email: 'test@example.net',
      certificationCenterId,
    });
    await databaseBuilder.commit();

    const dataProtectionOfficer = {
      firstName: 'Justin',
      lastName: 'Ptipeu',
      email: 'justin.ptipeu@example.net',
      certificationCenterId,
    };

    // when
    const updatedDataProtectionOfficer = await updateCertificationCenterDataProtectionOfficerInformation({
      dataProtectionOfficer,
      dataProtectionOfficerRepository,
    });

    // then
    expect(updatedDataProtectionOfficer).to.be.an.instanceOf(DataProtectionOfficer);
    expect(updatedDataProtectionOfficer.id).to.be.a('number').and.to.equal(dataProtectionOfficerToUpdate.id);
    expect(updatedDataProtectionOfficer.firstName).to.equal('Justin');
    expect(updatedDataProtectionOfficer.lastName).to.equal('Ptipeu');
    expect(updatedDataProtectionOfficer.email).to.equal('justin.ptipeu@example.net');
    expect(updatedDataProtectionOfficer.certificationCenterId).to.equal(certificationCenterId);
    expect(updatedDataProtectionOfficer.organizationId).to.be.null;
  });
});
