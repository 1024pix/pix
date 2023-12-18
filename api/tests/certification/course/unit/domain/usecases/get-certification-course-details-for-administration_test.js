import { getV3CertificationCourseDetailsForAdministration } from '../../../../../../src/certification/course/domain/usecases/get-v3-certification-course-details-for-administration.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-certification-course-details-for-administration', function () {
  it('should return the details', function () {
    // given
    const certificationCourseId = '1234';

    // when
    const details = getV3CertificationCourseDetailsForAdministration({ certificationCourseId });

    // then
    const expectedDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({ certificationCourseId });
    expect(details).to.deep.equal(expectedDetails);
  });
});
