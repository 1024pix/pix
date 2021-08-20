const { expect, EMPTY_BLANK_AND_NULL, domainBuilder } = require('../../../test-helper');
const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | CertificationReport', function() {

  describe('#constructor', function() {
    // eslint-disable-next-line mocha/no-setup-in-describe
    EMPTY_BLANK_AND_NULL.forEach((examinerComment) => {
      it(`should return no examiner comment if comment is "${examinerComment}"`, function() {
        // when
        const certificationReport = new CertificationReport({ examinerComment });

        // then
        expect(certificationReport.examinerComment).to.equal(CertificationReport.NO_EXAMINER_COMMENT);
      });
    });
  });

  describe('#fromCertificationCourse', function() {
    it('should return a certificationReport from a certificationCourse', function() {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse();
      const certificationCourseDTO = certificationCourse.toDTO();
      const expectedCertificationReport = domainBuilder.buildCertificationReport({
        id: `CertificationReport:${certificationCourseDTO.id}`,
        certificationCourseId: certificationCourseDTO.id,
        examinerComment: null,
        certificationIssueReports: certificationCourseDTO.certificationIssueReports,
        firstName: certificationCourseDTO.firstName,
        isCompleted: true,
        lastName: certificationCourseDTO.lastName,
      });

      // when
      const certificationReport = CertificationReport.fromCertificationCourse(certificationCourse);

      // then
      expect(certificationReport).to.deepEqualInstance(expectedCertificationReport);
    });

    it('should return a certificationReport from a uncompleted certificationCourse', function() {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        assessment: domainBuilder.buildAssessment({ state: Assessment.states.STARTED }),
      });

      // when
      const { isCompleted } = CertificationReport.fromCertificationCourse(certificationCourse);

      // then
      expect(isCompleted).to.be.false;
    });

    it('should return a certificationReport from a completed certificationCourse', function() {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse(
        {
          assessment: domainBuilder.buildAssessment({ state: Assessment.states.COMPLETED }),
        });

      // when
      const { isCompleted } = CertificationReport.fromCertificationCourse(certificationCourse);

      // then
      expect(isCompleted).to.be.true;
    });
  });
});
