const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const saveCertificationIssueReport = require('../../../../lib/domain/usecases/save-certification-issue-report');
const { InvalidCertificationIssueReportForSaving, NotFoundError } = require('../../../../lib/domain/errors');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | UseCase | save-certification-issue-report', () => {

  describe('#saveCertificationIssueReport', () => {

    let certificationCourseRepository;
    let certificationIssueReportRepository;
    let sessionAuthorizationService;

    beforeEach(() => {
      certificationCourseRepository = { get: sinon.stub() };
      certificationIssueReportRepository = { save: sinon.stub() };
      sessionAuthorizationService = { isAuthorizedToAccessSession: sinon.stub() };
    });

    context('when certificationCourseId is not valid', () => {

      it('should throw an error', async () => {
        // given
        const userId = 'un user id';
        certificationCourseRepository.get.resolves(null);
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ certificationCourseId: 'un id completement aberrant' });

        // when
        const error = await catchErr(saveCertificationIssueReport)({
          userId,
          certificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(error).to.be.instanceOf(InvalidCertificationIssueReportForSaving);
        expect(error.message).to.be.equal('Il y a un soucis avec l\'identification de cette certification, impossible de sauvegarder le signalement.');
      });
    });

    context('when the user is not authorized', () => {

      it('should throw an error', async () => {
        // given
        const sessionId = 1;
        const userId = 'not authorized user id';
        const certificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(false);
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ certificationCourseId: 'un id completement aberrant' });

        // when
        const error = await catchErr(saveCertificationIssueReport)({
          userId,
          certificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('Erreur lors de la sauvegarde du signalement. Veuillez vous connecter et réessayer.');
      });
    });

    context('when category of issue is not valid', () => {

      it('should throw a validation error', async () => {
        // given
        const userId = 'un user id';
        certificationCourseRepository.get.resolves(null);
        const badCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          category: 'une categorie inexistante',
        });

        // when
        const error = await catchErr(saveCertificationIssueReport)({
          userId,
          certificationIssueReport: badCertificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(error).to.be.instanceOf(InvalidCertificationIssueReportForSaving);
      });
    });

    context('when certificationCourseId is valid and user is authorized', () => {

      it('should save the certification issue report', async () => {
        // given
        const sessionId = 1;
        const userId = 1;
        const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(true);
        certificationCourseRepository.get.resolves(aCertificationCourse);
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          certificationCourseId: aCertificationCourse.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'une description',
        });
        certificationIssueReportRepository.save.resolves(certificationIssueReport);

        // when
        const certifIssueReportResult = await saveCertificationIssueReport({
          userId,
          certificationIssueReport,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(certifIssueReportResult).to.deep.equal(certificationIssueReport);
      });
    });
  });

});
