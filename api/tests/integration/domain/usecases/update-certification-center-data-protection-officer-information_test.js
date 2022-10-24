const { knex, expect, databaseBuilder } = require('../../../test-helper');
const DataProtectionOfficer = require('../../../../lib/domain/models/DataProtectionOfficer');
const updateCertificationCenterDataProtectionOfficerInformation = require('../../../../lib/domain/usecases/update-certification-center-data-protection-officer-information');
const dataProtectionOfficerRepository = require('../../../../lib/infrastructure/repositories/data-protection-officer-repository');

describe('Integration | UseCases | update-certification-center-data-protection-officer-information', function () {
  afterEach(async function () {
    await knex('data-protection-officers').delete();
  });

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
