import { getV3CertificationCourseDetailsForAdministration } from '../../../../../../src/certification/course/domain/usecases/get-v3-certification-course-details-for-administration.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-certification-course-details-for-administration', function () {
  it('should return the details', function () {
    // given
    const certificationCourseId = '1234';
    const v3CertificationCourseDetailsForAdministrationRepository = {
      getV3DetailsByCertificationCourseId: sinon.stub(),
    };

    const expectedDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
      certificationCourseId,
    });

    v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId
      .withArgs({ certificationCourseId })
      .returns(expectedDetails);

    // when
    const details = getV3CertificationCourseDetailsForAdministration({
      certificationCourseId,
      v3CertificationCourseDetailsForAdministrationRepository,
    });

    // then
    expect(details).to.deep.equal(expectedDetails);
  });
});
