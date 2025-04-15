import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | UseCases | get-center-for-admin', function () {
  it('should get the certification center for admin', async function () {
    // given
    const certificationCenterId = 1234;
    const date = new Date();
    const userId = databaseBuilder.factory.buildUser.withRole({ firstName: 'toto', lastName: 'tutu' }).id;
    databaseBuilder.factory.buildCertificationCenter({
      id: certificationCenterId,
      name: 'Center for admin',
      archivedAt: date,
      archivedBy: userId,
    });
    databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
      certificationCenterId,
      firstName: 'John',
      lastName: 'Doe',
    });

    await databaseBuilder.commit();

    // when
    const certificationCenter = await usecases.getCenterForAdmin({
      id: 1234,
    });

    // then
    expect(certificationCenter).to.be.instanceOf(CenterForAdmin);
    expect(certificationCenter.id).to.equal(certificationCenterId);
    expect(certificationCenter.name).to.equal('Center for admin');
    expect(certificationCenter.dataProtectionOfficerFirstName).to.equal('John');
    expect(certificationCenter.dataProtectionOfficerLastName).to.equal('Doe');
    expect(certificationCenter.archivedAt).to.deep.equal(date);
    expect(certificationCenter.archivistFullName).to.equal('toto tutu');
  });
});
