const { expect, sinon, domainBuilder } = require('../../../test-helper');
const saveCertificationIssueReport = require('../../../../lib/domain/usecases/save-certification-issue-report');
const {
  CertificationIssueReportCategories,
} = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');

describe('Unit | UseCase | save-certification-issue-report', function () {
  describe('#saveCertificationIssueReport', function () {
    it('should save the certification issue report', async function () {
      // given
      const certificationIssueReportRepository = { save: sinon.stub() };
      const sessionId = 1;
      const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
      const certificationIssueReportDTO = {
        certificationCourseId: aCertificationCourse.getId(),
        category: CertificationIssueReportCategories.FRAUD,
        description: 'une description',
      };
      const expectedCertificationIssueReport = new CertificationIssueReport(certificationIssueReportDTO);
      certificationIssueReportRepository.save.resolves(expectedCertificationIssueReport);

      // when
      const certifIssueReportResult = await saveCertificationIssueReport({
        certificationIssueReportDTO,
        certificationIssueReportRepository,
      });

      // then
      expect(certifIssueReportResult).to.deep.equal(expectedCertificationIssueReport);
    });
  });
});
