const { expect, domainBuilder, sinon } = require('../../../test-helper');
const getCertificationCenter = require('../../../../lib/domain/usecases/get-certification-center');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');

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
    certificationCenterRepository.get.withArgs(1234).resolves(certificationCenter);

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
