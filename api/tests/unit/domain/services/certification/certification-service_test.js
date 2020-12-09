const { expect, sinon } = require('../../../../test-helper');
const certificationService = require('../../../../../lib/domain/services/certification-service');

const AssessmentResult = require('../../../../../lib/domain/models/AssessmentResult');
const CompetenceMarks = require('../../../../../lib/domain/models/CompetenceMark');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');
const CertificationIssueReport = require('../../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');
const assessmentRepository = require('../../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../../lib/infrastructure/repositories/assessment-result-repository');
const certificationAssessmentRepository = require('../../../../../lib/infrastructure/repositories/certification-assessment-repository');
const certificationCourseRepository = require('../../../../../lib/infrastructure/repositories/certification-course-repository');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');
const cleaCertificationStatusRepository = require('../../../../../lib/infrastructure/repositories/clea-certification-status-repository');

function _buildCompetenceMarks(level, score, area_code, competence_code, competenceId) {
  return new CompetenceMarks({ level, score, area_code, competence_code, competenceId });
}

function _buildAssessmentResult(pixScore) {
  return new AssessmentResult({
    id: 'assessment_result_id',
    pixScore,
    emitter: 'PIX-ALGO',
  });
}

describe('Unit | Service | Certification Service', function() {

  describe('Certification Result computations', () => {
    const certificationAssessment = Symbol('certificationAssessment');

    beforeEach(() => {
      sinon.stub(certificationAssessmentRepository, 'getByCertificationCourseId').resolves(certificationAssessment);
      sinon.stub(certificationResultService, 'getCertificationResult').resolves();
    });

    describe('#calculateCertificationResultByCertificationCourseId', () => {

      it('should call Certification Assessment Repository to get CertificationAssessment by CertificationCourseId', async () => {
        // when
        await certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        sinon.assert.calledOnce(certificationAssessmentRepository.getByCertificationCourseId);
        sinon.assert.calledWith(certificationAssessmentRepository.getByCertificationCourseId, 'course_id');
      });

      it('should call CertificationResultService with appropriate arguments', async () => {
        // when
        await certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        sinon.assert.calledWith(certificationResultService.getCertificationResult, {
          certificationAssessment,
          continueOnError: true,
        });
      });
    });
  });

  describe('#getCertificationResult', () => {
    const certificationCourseId = 1;
    const cleaCertificationStatus = 'someStatus';
    const assessmentId = Symbol('assessmentId');

    beforeEach(() => {
      sinon.stub(cleaCertificationStatusRepository, 'getCleaCertificationStatus').resolves(cleaCertificationStatus);
      sinon.stub(assessmentRepository, 'getIdByCertificationCourseId')
        .withArgs(certificationCourseId).resolves(assessmentId);
    });

    context('when certification is finished', () => {
      let certificationCourse;

      beforeEach(() => {
        certificationCourse = new CertificationCourse({
          id: certificationCourseId,
          createdAt: new Date('2017-12-23T15:23:12Z'),
          completedAt: new Date('2017-12-23T16:23:12Z'),
          firstName: 'Pumba',
          lastName: 'De La Savane',
          birthplace: 'Savane',
          birthdate: '1992-01-28',
          sessionId: 123,
          externalId: 'TimonsFriend',
          certificationIssueReports: [
            new CertificationIssueReport({ id: 1, category: CertificationIssueReportCategories.OTHER, certificationCourseId, description: 'Some comment' }),
          ],
          hasSeenEndTestScreen: true,
        });
        sinon.stub(certificationCourseRepository, 'get').resolves(certificationCourse);
        const assessmentResult = _buildAssessmentResult(20);
        assessmentResult.competenceMarks = [_buildCompetenceMarks(3, 27, '2', '2.1', 'rec2.1')];
        sinon.stub(assessmentResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks')
          .withArgs({ certificationCourseId }).resolves({ ...assessmentResult, assessmentId });
      });

      it('should return certification results with pix score, date and certified competences levels', async () => {
        // when
        const certification = await certificationService.getCertificationResult(certificationCourseId);

        // then
        expect(certification.assessmentId).to.equal(assessmentId);
        expect(certification.pixScore).to.deep.equal(20);
        expect(certification.createdAt).to.deep.equal(new Date('2017-12-23T15:23:12Z'));
        expect(certification.completedAt).to.deep.equal(new Date('2017-12-23T16:23:12Z'));
        expect(certification.competencesWithMark).to.deep.equal([{
          area_code: '2',
          assessmentResultId: undefined,
          competence_code: '2.1',
          competenceId: 'rec2.1',
          id: undefined,
          level: 3,
          score: 27,
        }]);
        expect(certification.sessionId).to.deep.equal(123);
      });

      it('should return certified user informations', async function() {
        // when
        const certification = await certificationService.getCertificationResult(certificationCourseId);

        // then
        expect(certification.id).to.deep.equal(certificationCourseId);
        expect(certification.firstName).to.deep.equal('Pumba');
        expect(certification.lastName).to.deep.equal('De La Savane');
        expect(certification.birthplace).to.deep.equal('Savane');
        expect(certification.birthdate).to.deep.equal('1992-01-28');
        expect(certification.externalId).to.deep.equal('TimonsFriend');
        expect(certification.certificationIssueReports).to.deep.equal([
          new CertificationIssueReport({ id: 1, category: CertificationIssueReportCategories.OTHER, certificationCourseId, description: 'Some comment' }),
        ]);
        expect(certification.hasSeenEndTestScreen).to.deep.equal(true);
        expect(certification.cleaCertificationStatus).to.deep.equal(cleaCertificationStatus);
      });
    });

    context('when certification is not finished', () => {

      beforeEach(() => {
        sinon.stub(assessmentResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks')
          .withArgs({ certificationCourseId }).resolves(null);
        sinon.stub(certificationCourseRepository, 'get').resolves(new CertificationCourse({
          id: certificationCourseId,
          createdAt: new Date('2017-12-23T15:23:12Z'),
          firstName: 'Pumba',
          lastName: 'De La Savane',
          birthplace: 'Savane',
          birthdate: '1992-01-28',
          sessionId: 123,
          externalId: 'TimonsFriend',
          examinerComment: 'Hakuna matata',
          certificationIssueReports: [
            new CertificationIssueReport({ id: 1, category: CertificationIssueReportCategories.OTHER, certificationCourseId, description: 'Hakuna matata' }),
          ],
          hasSeenEndTestScreen: false,
        }));
      });

      it('should return certification results with state at started, empty marks and undefined for information not yet valid', () => {
        // given
        const certificationCourseId = 1;

        // when
        const promise = certificationService.getCertificationResult(certificationCourseId);

        // then
        return promise.then((certification) => {
          expect(certification.status).to.deep.equal('started');
          expect(certification.competencesWithMark).to.deep.equal([]);
          expect(certification.pixScore).to.deep.equal(undefined);
          expect(certification.completedAt).to.deep.equal(undefined);
          expect(certification.createdAt).to.deep.equal(new Date('2017-12-23T15:23:12Z'));
          expect(certification.sessionId).to.deep.equal(123);
          expect(certification.certificationIssueReports[0].description).to.deep.equal('Hakuna matata');
          expect(certification.hasSeenEndTestScreen).to.deep.equal(false);
        });
      });

      it('should know certification version', async () => {
        // given
        const certificationCourseId = 1;

        // when
        const certificationResult = await certificationService.getCertificationResult(certificationCourseId);

        // then
        expect(certificationResult.isV2Certification).to.be.false;
      });
    });
  });

});
