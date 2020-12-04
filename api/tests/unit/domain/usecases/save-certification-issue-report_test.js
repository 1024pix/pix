const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const saveCertificationIssueReport = require('../../../../lib/domain/usecases/save-certification-issue-report');
const { InvalidCertificationIssueReportForSaving } = require('../../../../lib/domain/errors');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | UseCase | save-certification-issue-report', () => {

  describe('#saveCertificationIssueReport', () => {

    let certificationCourseRepository;
    let certificationIssueReportRepository;

    beforeEach(() => {
      certificationCourseRepository = { get: sinon.stub() };
      certificationIssueReportRepository = { save: sinon.stub() };
    });

    context('when certificationCourseId is not valid', () => {

      it('should throw an error', async () => {
        // given
        certificationCourseRepository.get.resolves(null);
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ certificationCourseId: 'un id completement aberrant' });

        // when 
        const error = await catchErr(saveCertificationIssueReport)({
          certificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        // then
          expect(error).to.be.instanceOf(InvalidCertificationIssueReportForSaving);
      });
    });

    context('when category of issue is not valid', () => {

      it('should throw a validation error', async () => {
        // given
        certificationCourseRepository.get.resolves(null);
        const badCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          category: 'une categorie inexistante',
        });

        // when 
        const error = await catchErr(saveCertificationIssueReport)({
          certificationIssueReport: badCertificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        // then
        expect(error).to.be.instanceOf(InvalidCertificationIssueReportForSaving);
      });
    });

    context('when certificationCourseId is valid', () => {

      it('should save the certification issue report', async () => {
        // given
        const aCertificationCourse = domainBuilder.buildCertificationCourse();
        certificationCourseRepository.get.resolves(aCertificationCourse);
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          certificationCourseId: aCertificationCourse.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'une description',
        });
        certificationIssueReportRepository.save.resolves(certificationIssueReport);

        // when
        const certifIssueReportResult = await saveCertificationIssueReport({
          certificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        // then
        expect(certifIssueReportResult).to.deep.equal(certificationIssueReport);
      });
    });
  });

});
