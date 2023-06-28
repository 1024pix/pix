import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { getCertificationCenterForAdmin } from '../../../../lib/shared/domain/usecases/get-certification-center-for-admin.js';
import { CertificationCenterForAdmin } from '../../../../lib/shared/domain/models/CertificationCenterForAdmin.js';

describe('Unit | UseCase | get-certification-center-for-admin', function () {
  let certificationCenterForAdmin;
  let certificationCenterForAdminRepository;

  beforeEach(function () {
    certificationCenterForAdmin = domainBuilder.buildCertificationCenterForAdmin({ id: 1234 });
    certificationCenterForAdminRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certification center for admin', async function () {
    // given
    certificationCenterForAdminRepository.get.withArgs(1234).resolves(certificationCenterForAdmin);

    // when
    const actualCertificationCourse = await getCertificationCenterForAdmin({
      id: 1234,
      certificationCenterForAdminRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(1234);
    expect(actualCertificationCourse).to.be.instanceOf(CertificationCenterForAdmin);
  });
});
