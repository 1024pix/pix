import lodash from 'lodash';

import { InvalidCertificationReportForFinalization } from '../../../../../../src/certification/shared/domain/errors.js';
import { CertificationReport } from '../../../../../../src/certification/shared/domain/models/CertificationReport.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { EMPTY_BLANK_AND_NULL } from '../../../../../tooling/test-utils/constants.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
const { keys } = lodash;

describe('Unit | Domain | Models | CertificationReport', function () {
  describe('#constructor', function () {
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
        isCompleted: true,
        abortReason: 'technical',
      });

      // when
      // then
      certificationReport.validateForFinalization();
    });

    [
      {
        certificationCourseId: null,
      },
      {
        certificationIssueReports: null,
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
});

const validCertificationReportData = {
  certificationCourseId: 1,
  certificationIssueReports: [],
  isCompleted: true,
  abortReason: 'technical',
};

function _getFieldName(wrongData) {
  return keys(wrongData)[0];
}
