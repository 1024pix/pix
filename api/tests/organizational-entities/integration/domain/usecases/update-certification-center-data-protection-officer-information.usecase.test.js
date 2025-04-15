import { DataProtectionOfficer } from '../../../../../src/organizational-entities/domain/models/DataProtectionOfficer.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Domain | UseCase | update-certification-center-data-protection-officer-information', function () {
  it('adds data protection officer information for a certification center', async function () {
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
    const updatedDataProtectionOfficer = await usecases.updateCertificationCenterDataProtectionOfficerInformation({
      dataProtectionOfficer,
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

  it('updates certification center data protection officer information', async function () {
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
    const updatedDataProtectionOfficer = await usecases.updateCertificationCenterDataProtectionOfficerInformation({
      dataProtectionOfficer,
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
