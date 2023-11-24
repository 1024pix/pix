import { expect, EMPTY_BLANK_AND_NULL, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { CertificationReport } from '../../../../../../src/certification/shared/domain/models/CertificationReport.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { InvalidCertificationReportForFinalization } from '../../../../../../lib/domain/errors.js';
import lodash from 'lodash';
const { keys } = lodash;
describe('Unit | Domain | Models | CertificationReport', function () {
  describe('#constructor', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    EMPTY_BLANK_AND_NULL.forEach((examinerComment) => {
      it(`should return no examiner comment if comment is "${examinerComment}"`, function () {
        // when
        const certificationReport = new CertificationReport({ examinerComment });

        // then
        expect(certificationReport.examinerComment).to.equal(CertificationReport.NO_EXAMINER_COMMENT);
      });
    });
  });

  describe('#validateForFinalization', function () {
    it('should validate valid fields without throwing an error', function () {
      // given
      const certificationReport = domainBuilder.buildCertificationReport({
        certificationCourseId: 1,
        certificationIssueReports: [],
        hasSeenEndTestScreen: true,
        isCompleted: true,
        abortReason: 'technical',
      });

      // when
      // then
      certificationReport.validateForFinalization();
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        certificationCourseId: null,
      },
      {
        certificationIssueReports: null,
      },
      {
        hasSeenEndTestScreen: null,
      },
      {
        isCompleted: null,
      },
    ].forEach((invalidData) =>
      it(`should throw an error if ${_getFieldName(invalidData)} is missing`, async function () {
        // given
        const certificationReport = new CertificationReport({
          ...validCertificationReportData,
          ...invalidData,
        });

        // when
        const error = await catchErr(certificationReport.validateForFinalization, certificationReport)();

        // then
        expect(error).to.be.instanceOf(InvalidCertificationReportForFinalization);
        expect(error.message).contains(_getFieldName(invalidData));
      }),
    );

    it('should throw an error if not completed and abortReason is empty', async function () {
      // given
      const certificationReport = new CertificationReport({
        ...validCertificationReportData,
        isCompleted: false,
        abortReason: null,
      });

      // when
      const error = await catchErr(certificationReport.validateForFinalization, certificationReport)();

      // then
      expect(error).to.be.instanceOf(InvalidCertificationReportForFinalization);
      expect(error.message).to.equal('Abort reason is required if certificationReport is not completed');
    });
  });

  describe('#fromCertificationCourse', function () {
    it('should return a certificationReport from a certificationCourse', function () {
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

    it('should return a certificationReport from a uncompleted certificationCourse', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        assessment: domainBuilder.buildAssessment({ state: Assessment.states.STARTED }),
      });

      // when
      const { isCompleted } = CertificationReport.fromCertificationCourse(certificationCourse);

      // then
      expect(isCompleted).to.be.false;
    });

    it('should return a certificationReport from a completed certificationCourse', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        assessment: domainBuilder.buildAssessment({ state: Assessment.states.COMPLETED }),
      });

      // when
      const { isCompleted } = CertificationReport.fromCertificationCourse(certificationCourse);

      // then
      expect(isCompleted).to.be.true;
    });
  });
});

const validCertificationReportData = {
  certificationCourseId: 1,
  certificationIssueReports: [],
  hasSeenEndTestScreen: true,
  isCompleted: true,
  abortReason: 'technical',
};

function _getFieldName(wrongData) {
  return keys(wrongData)[0];
}
