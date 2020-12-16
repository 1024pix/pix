const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const saveCertificationIssueReport = require('../../../../lib/domain/usecases/save-certification-issue-report');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');

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

    context('when the user is not authorized', () => {

      it('should throw an error', async () => {
        // given
        const sessionId = 1;
        const userId = 'not authorized user id';
        const certificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(false);
        const certificationIssueReportDTO = { certificationCourseId: 'un id completement aberrant' };

        // when
        const error = await catchErr(saveCertificationIssueReport)({
          userId,
          certificationIssueReportDTO,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('Erreur lors de la sauvegarde du signalement. Veuillez vous connecter et réessayer.');
      });
    });

    context('when user is authorized', () => {

      it('should save the certification issue report', async () => {
        // given
        const sessionId = 1;
        const userId = 1;
        const aCertificationCourse = domainBuilder.buildCertificationCourse({ sessionId });
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(true);
        certificationCourseRepository.get.resolves(aCertificationCourse);
        const certificationIssueReportDTO = {
          certificationCourseId: aCertificationCourse.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'une description',
        };
        const expectedCertificationIssueReport = new CertificationIssueReport(certificationIssueReportDTO);
        certificationIssueReportRepository.save.resolves(expectedCertificationIssueReport);

        // when
        const certifIssueReportResult = await saveCertificationIssueReport({
          userId,
          certificationIssueReportDTO,
          certificationCourseRepository,
          certificationIssueReportRepository,
          sessionAuthorizationService,
        });

        // then
        expect(certifIssueReportResult).to.deep.equal(expectedCertificationIssueReport);
      });
    });
  });

});
