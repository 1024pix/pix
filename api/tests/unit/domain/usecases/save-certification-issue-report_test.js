import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { saveCertificationIssueReport } from '../../../../lib/domain/usecases/save-certification-issue-report.js';
import { CertificationIssueReport } from '../../../../src/certification/shared/domain/models/CertificationIssueReport.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | save-certification-issue-report', function () {
  describe('#saveCertificationIssueReport', function () {
    describe('when there is a category of issue report', function () {
      describe('when the category of issue report exists', function () {
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

      describe('when the category of issue report does not exist', function () {
        it('should throw a Not Found domain error', async function () {
          // given
          const issueReportCategoryRepository = { get: sinon.stub() };
          const sessionId = 1;
          const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
          const issueReportCategoryName = 'NON_EXISTING_CATEGORY_NAME';
          const certificationIssueReportDTO = {
            certificationCourseId: aCertificationCourse.getId(),
            category: issueReportCategoryName,
            description: 'une description',
          };
          issueReportCategoryRepository.get.throws(
            new NotFoundError(`The category issue report name ${issueReportCategoryName} does not exist`),
          );

          // when
          const error = await catchErr(saveCertificationIssueReport)({
            certificationIssueReportDTO,
            issueReportCategoryRepository,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.equal(`The category issue report name ${issueReportCategoryName} does not exist`);
        });
      });
    });

    describe('when there is a subcategory of issue report', function () {
      describe('when the subcategory of issue report exists', function () {
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
});
