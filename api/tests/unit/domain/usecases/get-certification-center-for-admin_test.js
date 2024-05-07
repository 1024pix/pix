import { CertificationCenterForAdmin } from '../../../../lib/domain/models/CertificationCenterForAdmin.js';
import { getCertificationCenterForAdmin } from '../../../../lib/domain/usecases/get-certification-center-for-admin.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-certification-center-for-admin', function () {
  let certificationCenterForAdmin;
  let centerRepository;

  beforeEach(function () {
    certificationCenterForAdmin = domainBuilder.buildCertificationCenterForAdmin({ id: 1234 });
    centerRepository = {
      getById: sinon.stub(),
    };
  });

  it('should get the certification center for admin', async function () {
    // given
    centerRepository.getById.withArgs({ id: 1234 }).resolves(certificationCenterForAdmin);

    // when
    const actualCertificationCourse = await getCertificationCenterForAdmin({
      id: 1234,
      centerRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(1234);
    expect(actualCertificationCourse).to.be.instanceOf(CertificationCenterForAdmin);
  });
});
