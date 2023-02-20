import { expect, sinon, domainBuilder } from '../../../test-helper';
import saveCertificationIssueReport from '../../../../lib/domain/usecases/save-certification-issue-report';
import CertificationIssueReport from '../../../../lib/domain/models/CertificationIssueReport';

describe('Unit | UseCase | save-certification-issue-report', function () {
  describe('#saveCertificationIssueReport', function () {
    describe('when there is a category of issue report', function () {
      it('should save the certification issue report', async function () {
        // given
        const certificationIssueReportRepository = { save: sinon.stub() };
        const issueReportCategoryRepository = { get: sinon.stub() };
        const sessionId = 1;
        const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        const certificationIssueReportDTO = {
          certificationCourseId: aCertificationCourse.getId(),
          category: 'FRAUD',
          description: 'une description',
        };
        const expectedCertificationIssueReport = new CertificationIssueReport(certificationIssueReportDTO);
        issueReportCategoryRepository.get
          .withArgs({ name: certificationIssueReportDTO.category })
          .resolves({ id: 1234, name: certificationIssueReportDTO.category });
        certificationIssueReportRepository.save.resolves(expectedCertificationIssueReport);

        // when
        const certifIssueReportResult = await saveCertificationIssueReport({
          certificationIssueReportDTO,
          certificationIssueReportRepository,
          issueReportCategoryRepository,
        });

        // then
        expect(certifIssueReportResult).to.deep.equal(expectedCertificationIssueReport);
      });
    });

    describe('when there is a subcategory of issue report', function () {
      it('should save the certification issue report', async function () {
        // given
        const certificationIssueReportRepository = { save: sinon.stub() };
        const issueReportCategoryRepository = { get: sinon.stub() };
        const sessionId = 1;
        const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        const certificationIssueReportDTO = {
          certificationCourseId: aCertificationCourse.getId(),
          category: 'IN_CHALLENGE',
          subcategory: 'EMBED_NOT_WORKING',
          description: 'une description',
          questionNumber: 1,
        };
        const expectedCertificationIssueReport = new CertificationIssueReport(certificationIssueReportDTO);
        issueReportCategoryRepository.get
          .withArgs({ name: certificationIssueReportDTO.subcategory })
          .resolves({ id: 1234, name: certificationIssueReportDTO.subcategory });
        certificationIssueReportRepository.save.resolves(expectedCertificationIssueReport);

        // when
        const certifIssueReportResult = await saveCertificationIssueReport({
          certificationIssueReportDTO,
          certificationIssueReportRepository,
          issueReportCategoryRepository,
        });

        // then
        expect(certifIssueReportResult).to.deep.equal(expectedCertificationIssueReport);
      });
    });
  });
});
