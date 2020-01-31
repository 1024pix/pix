const { expect, sinon } = require('../../../../test-helper');
const certificationService = require('../../../../../lib/domain/services/certification-service');
const Answer = require('../../../../../lib/domain/models/Answer');

const Assessment = require('../../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../../lib/domain/models/AssessmentResult');
const CompetenceMarks = require('../../../../../lib/domain/models/CompetenceMark');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

const assessmentRepository = require('../../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../../lib/infrastructure/repositories/assessment-result-repository');
const answersRepository = require('../../../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../../../../lib/infrastructure/repositories/certification-course-repository');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../../../../lib/infrastructure/repositories/challenge-repository');
const userService = require('../../../../../lib/domain/services/user-service');

function _buildCompetenceMarks(level, score, area_code, competence_code) {
  return new CompetenceMarks({ level, score, area_code, competence_code });
}

function _buildAssessmentResult(pixScore, level) {
  return new AssessmentResult({
    id: 'assessment_result_id',
    pixScore,
    level,
    emitter: 'PIX-ALGO',
  });
}

describe('Unit | Service | Certification Service', function() {

  describe('Certification Result computations', () => {
    const dateCreationCertif = new Date('2018-01-01T01:02:03Z');

    const certificationAssessment = new Assessment({
      id: 'assessment_id',
      userId: 'user_id',
      courseId: 'course_id',
      createdAt: dateCreationCertif,
      state: 'completed',
    });

    const certificationCourseV1 = new CertificationCourse({
      id: 'course_id',
      status: 'completed',
      completedAt: dateCreationCertif,
      isV2Certification: false
    });

    beforeEach(() => {
      sinon.stub(assessmentRepository, 'getByCertificationCourseId').resolves(certificationAssessment);
      sinon.stub(answersRepository, 'findByAssessment').resolves([]);
      sinon.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves([]);
      sinon.stub(competenceRepository, 'list').resolves([]);
      sinon.stub(challengeRepository, 'list').resolves([]);
      sinon.stub(userService, 'getCertificationProfile').withArgs({
        userId: 'user_id',
        limitDate: dateCreationCertif,
        isV2Certification: certificationCourseV1.isV2Certification,
      }).resolves([]);
      sinon.stub(certificationCourseRepository, 'get').resolves(certificationCourseV1);
    });

    describe('#calculateCertificationResultByAssessmentId', () => {

      it('should call Assessment Repository to get Assessment by CertificationCourseId', function() {
        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(assessmentRepository.getByCertificationCourseId);
          sinon.assert.calledWith(assessmentRepository.getByCertificationCourseId, 'course_id');
        });
      });
    });

    describe('#calculateCertificationResultByCertificationCourseId', () => {

      it('should call Assessment Repository to get Assessment by CertificationCourseId', function() {
        // when
        const promise = certificationService.calculateCertificationResultByCertificationCourseId('course_id');

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(assessmentRepository.getByCertificationCourseId);
          sinon.assert.calledWith(assessmentRepository.getByCertificationCourseId, 'course_id');
        });
      });
    });
  });

  describe('#getCertificationResult', () => {
    const certificationCourseId = 1;

    context('when certification is finished', () => {

      beforeEach(() => {
        const assessmentResult = _buildAssessmentResult(20, 3);
        sinon.stub(assessmentRepository, 'getByCertificationCourseId').resolves(new Assessment({
          state: 'completed',
          assessmentResults: [
            _buildAssessmentResult(20, 3),
          ],
        }));
        sinon.stub(certificationCourseRepository, 'get').resolves(new CertificationCourse({
          id: certificationCourseId,
          createdAt: new Date('2017-12-23T15:23:12Z'),
          completedAt: new Date('2017-12-23T16:23:12Z'),
          firstName: 'Pumba',
          lastName: 'De La Savane',
          birthplace: 'Savane',
          birthdate: '1992-01-28',
          sessionId: 123,
          externalId: 'TimonsFriend',
          examinerComment: '',
          hasSeenEndTestScreen: true,
        }));
        assessmentResult.competenceMarks = [_buildCompetenceMarks(3, 27, '2', '2.1')];
        sinon.stub(assessmentResultRepository, 'get').resolves(
          assessmentResult,
        );
      });

      it('should return certification results with pix score, date and certified competences levels', async () => {
        // when
        const certification = await certificationService.getCertificationResult(certificationCourseId);

        // then
        expect(certification.pixScore).to.deep.equal(20);
        expect(certification.createdAt).to.deep.equal(new Date('2017-12-23T15:23:12Z'));
        expect(certification.completedAt).to.deep.equal(new Date('2017-12-23T16:23:12Z'));
        expect(certification.competencesWithMark).to.deep.equal([{
          area_code: '2',
          assessmentResultId: undefined,
          competence_code: '2.1',
          id: undefined,
          level: 3,
          score: 27,
        }]);
        expect(certification.sessionId).to.deep.equal(123);
      });

      it('should return certified user informations', function() {
        // when
        const promise = certificationService.getCertificationResult(certificationCourseId);

        // then
        return promise.then((certification) => {
          expect(certification.id).to.deep.equal(certificationCourseId);
          expect(certification.firstName).to.deep.equal('Pumba');
          expect(certification.lastName).to.deep.equal('De La Savane');
          expect(certification.birthplace).to.deep.equal('Savane');
          expect(certification.birthdate).to.deep.equal('1992-01-28');
          expect(certification.externalId).to.deep.equal('TimonsFriend');
          expect(certification.examinerComment).to.deep.equal('');
          expect(certification.hasSeenEndTestScreen).to.deep.equal(true);
        });
      });

    });

    context('when certification is not finished', () => {

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'getByCertificationCourseId').resolves(new Assessment({
          state: 'started',
        }));
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
          hasSeenEndTestScreen: false,
        }));
        sinon.stub(assessmentResultRepository, 'get').resolves(null);
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
          expect(certification.examinerComment).to.deep.equal('Hakuna matata');
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

  describe('#computeAnswersSuccessRate', () => {

    context('when no answers is given', () => {

      it('should have a trust level has unknown', () => {
        // given
        const answers = [];

        // when
        const successRate = certificationService._computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when all answers are OK', () => {

      it('should have a success rate of 100%', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ok' })];

        // when
        const successRate = certificationService._computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(100);
      });
    });

    context('when all answers are KO', () => {

      it('should have a success rate of 0%', () => {
        // given
        const answers = [new Answer({ result: 'ko' }), new Answer({ result: 'ko' })];

        // when
        const successRate = certificationService._computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when the answers are a mixed of valid and wrong answers', () => {

      it('should have a success rate of 50% with 1W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ko' })];

        // when
        const successRate = certificationService._computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(50);
      });

      it('should have a success rate of 50% with 2W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'aband' }), new Answer({ result: 'ko' })];

        // when
        const successRate = certificationService._computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.be.within(33.333333, 33.333334);
      });

    });
  });

});
