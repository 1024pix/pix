const { databaseBuilder, domainBuilder, expect, knex } = require('../../../test-helper');
const CertificationCenterForAdmin = require('../../../../lib/domain/models/CertificationCenterForAdmin');
const updateCertificationCenter = require('../../../../lib/domain/usecases/update-certification-center');
const certificationCenterForAdminRepository = require('../../../../lib/infrastructure/repositories/certification-center-for-admin-repository');
const complementaryCertificationHabilitationRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-habilitation-repository');
const dataProtectionOfficerRepository = require('../../../../lib/infrastructure/repositories/data-protection-officer-repository');

describe('Integration | UseCases | update-certification-center', function () {
  afterEach(async function () {
    await knex('complementary-certification-habilitations').delete();
    await knex('data-protection-officers').delete();
  });

  it('should update certification center and his data protection officer information', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
    const certificationCenter = domainBuilder.buildCertificationCenterForAdmin({
      id: certificationCenterId,
      name: 'Pix Super Center',
      type: 'PRO',
      habilitations: [],
      dataProtectionOfficerFirstName: 'Justin',
      dataProtectionOfficerLastName: 'Ptipeu',
      dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
    });
    const complementaryCertificationIds = [complementaryCertification.id];

    await databaseBuilder.commit();

    // when
    const updatedCertificationCenter = await updateCertificationCenter({
      certificationCenter,
      complementaryCertificationIds,
      certificationCenterForAdminRepository,
      complementaryCertificationHabilitationRepository,
      dataProtectionOfficerRepository,
    });

    // then
    expect(updatedCertificationCenter).to.be.an.instanceOf(CertificationCenterForAdmin);

    expect(updatedCertificationCenter.name).to.equal('Pix Super Center');

    expect(updatedCertificationCenter.dataProtectionOfficerFirstName).to.equal('Justin');
    expect(updatedCertificationCenter.dataProtectionOfficerLastName).to.equal('Ptipeu');
    expect(updatedCertificationCenter.dataProtectionOfficerEmail).to.equal('justin.ptipeu@example.net');

    expect(updatedCertificationCenter.habilitations.length).to.equal(1);
    expect(updatedCertificationCenter.habilitations[0].id).to.equal(complementaryCertification.id);
    expect(updatedCertificationCenter.habilitations[0].key).to.equal(complementaryCertification.key);
    expect(updatedCertificationCenter.habilitations[0].label).to.equal(complementaryCertification.label);
  });
});
