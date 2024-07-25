import { getCertificationCenter } from '../../../../../../src/certification/enrolment/domain/usecases/get-certification-center.js';
import { CertificationCenter } from '../../../../../../src/shared/domain/models/CertificationCenter.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-certification-center', function () {
  let certificationCenter;
  let certificationCenterRepository;

  beforeEach(function () {
    certificationCenter = domainBuilder.buildCertificationCenter({ id: 1234 });
    certificationCenterRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certification center', async function () {
    // given
    certificationCenterRepository.get.withArgs({ id: 1234 }).resolves(certificationCenter);

    // when
    const actualCertificationCourse = await getCertificationCenter({
      id: 1234,
      certificationCenterRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(1234);
    expect(actualCertificationCourse).to.be.instanceOf(CertificationCenter);
  });
});
