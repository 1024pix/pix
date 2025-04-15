import * as centerRepository from '../../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import { updateCertificationCenter } from '../../../../../src/organizational-entities/domain/usecases/update-certification-center.usecase.js';
import * as certificationCenterForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
import * as complementaryCertificationHabilitationRepository from '../../../../../src/organizational-entities/infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../../../../src/organizational-entities/infrastructure/repositories/data-protection-officer.repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Domain | UseCases | update-certification-center', function () {
  it('updates certification center and its data protection officer information', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
      firstName: 'Eddy',
      lastName: 'Taurial',
      email: 'eddy.taurial@example.net',
      certificationCenterId,
    }).id;

    const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
    const certificationCenterInformation = domainBuilder.buildCenterForAdmin({
      center: {
        id: certificationCenterId,
        name: 'Pix Super Center',
        type: 'PRO',
        habilitations: [],
      },
      dataProtectionOfficer: {
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
      },
    });
    const complementaryCertificationIds = [complementaryCertification.id];

    await databaseBuilder.commit();

    // when
    const updatedCertificationCenter = await updateCertificationCenter({
      certificationCenterId,
      certificationCenterInformation,
      complementaryCertificationIds,
      certificationCenterForAdminRepository,
      complementaryCertificationHabilitationRepository,
      dataProtectionOfficerRepository,
      centerRepository,
    });

    // then
    expect(updatedCertificationCenter).to.be.an.instanceOf(CenterForAdmin);

    expect(updatedCertificationCenter.name).to.equal('Pix Super Center');

    expect(updatedCertificationCenter.dataProtectionOfficerFirstName).to.equal('Justin');
    expect(updatedCertificationCenter.dataProtectionOfficerLastName).to.equal('Ptipeu');
    expect(updatedCertificationCenter.dataProtectionOfficerEmail).to.equal('justin.ptipeu@example.net');

    expect(updatedCertificationCenter.habilitations).to.have.lengthOf(1);
    expect(updatedCertificationCenter.habilitations[0].complementaryCertificationId).to.equal(
      complementaryCertification.id,
    );
    expect(updatedCertificationCenter.habilitations[0].key).to.equal(complementaryCertification.key);
    expect(updatedCertificationCenter.habilitations[0].label).to.equal(complementaryCertification.label);
  });
});
