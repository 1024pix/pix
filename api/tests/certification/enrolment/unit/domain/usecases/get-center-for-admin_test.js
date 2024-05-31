import { getCenterForAdmin } from '../../../../../../src/certification/enrolment/domain/usecases/get-center-for-admin.js';
import { CenterForAdmin } from '../../../../../../src/certification/session-management/domain/models/CenterForAdmin.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-center-for-admin', function () {
  let certificationCenterForAdmin;
  let centerRepository;
  let dataProtectionOfficerRepository;

  beforeEach(function () {
    certificationCenterForAdmin = domainBuilder.buildCenterForAdmin({ center: { id: 1234 } });
    centerRepository = {
      getById: sinon.stub(),
    };
    dataProtectionOfficerRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certification center for admin', async function () {
    // given
    centerRepository.getById.withArgs({ id: 1234 }).resolves({ ...certificationCenterForAdmin });

    // when
    const actualCertificationCourse = await getCenterForAdmin({
      id: 1234,
      centerRepository,
      dataProtectionOfficerRepository,
    });

    // then
    expect(actualCertificationCourse.id).to.equal(1234);
    expect(actualCertificationCourse).to.be.instanceOf(CenterForAdmin);
  });
});
