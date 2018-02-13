const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');
const assessmentAdapter = require('../../../../lib/infrastructure/adapters/assessment-adapter');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

const AssessmentBookshelf = require('../../../../lib/infrastructure/data/assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Course = require('../../../../lib/domain/models/Course');
const Challenge = require('../../../../lib/domain/models/Challenge');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

const Answer = require('../../../../lib/infrastructure/data/answer');
const Skill = require('../../../../lib/cat/skill');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');

function _buildChallenge(challengeId, skills) {
  const challenge = new Challenge();
  challenge.id = challengeId;
  challenge.skills = skills;
  return challenge;
}

function _buildAssessmentForCourse(courseId, assessmentId = 'assessment_id') {
  const assessment = new Assessment({ id: assessmentId });
  if (courseId) {
    assessment.courseId = courseId;
  }
  return assessment;
}

function _buildAnswer(challengeId, result, assessmentId = 1) {
  const answer = new Answer({ id: 'answer_id' });
  answer.set('challengeId', challengeId);
  answer.set('assessmentId', assessmentId);
  answer.set('result', result);
  return answer;
}

describe('Unit | Domain | Services | assessment', () => {

  beforeEach(() => {
    sinon.stub(competenceRepository, 'get');
  });

  afterEach(() => {
    competenceRepository.get.restore();
  });

  describe('#getAssessmentNextChallengeId', () => {

    beforeEach(() => {
      sinon.stub(courseRepository, 'get').resolves();
    });

    afterEach(() => {
      courseRepository.get.restore();
    });

    it('Should return the first challenge if no currentChallengeId is given', () => {
      // given
      courseRepository.get.resolves({ challenges: ['the_first_challenge'] });

      // when
      const promise = service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), null);

      // then
      return promise.then((result) => {
        expect(result).to.equal('the_first_challenge');
      });
    });

    it('Should return the next challenge if currentChallengeId is given', () => {
      // given
      courseRepository.get.resolves({ challenges: ['1st_challenge', '2nd_challenge'] });

      // when
      const promise = service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), '1st_challenge');

      // then
      return promise.then((result) => {
        expect(result).to.equal('2nd_challenge');
      });

    });

    it('Should throw a AssessmentEndedError when there are no more challenges to ask', () => {
      // given
      courseRepository.get.resolves({ challenges: ['1st_challenge', '2nd_challenge'] });

      // when
      const promise = service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), '2nd_challenge');

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });

    it('Should reject with a AssessmentEndedError when the course is a preview', () => {
      // given
      const assessment = _buildAssessmentForCourse('null22');
      assessment.type = 'PREVIEW';

      // when
      const promise = service.getAssessmentNextChallengeId(assessment, '1st_challenge');

      // then
      expect(courseRepository.get).not.to.have.been.called;
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });

  describe('#fetchAssessment', () => {

    const COURSE_ID = 123;
    const PREVIEW_COURSE_ID = 'nullfec89bd5-a706-419b-a6d2-f8805e708ace';

    const COMPETENCE_ID = 'competence_id';
    const COMPETENCE = { id: COMPETENCE_ID };

    const ASSESSMENT_ID = 836;
    const assessment = _buildAssessmentForCourse(COURSE_ID, ASSESSMENT_ID);

    const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ok', ASSESSMENT_ID);
    const wrongAnswerWeb2 = _buildAnswer('challenge_web_2', 'ko', ASSESSMENT_ID);

    const challenges = [
      _buildChallenge('challenge_web_1', [new Skill('@web1')]),
      _buildChallenge('challenge_web_2', [new Skill('@web2')])
    ];

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      competenceRepository.get.resolves(COMPETENCE);
      sandbox.stub(assessmentRepository, 'get').resolves(new Assessment({
        id: ASSESSMENT_ID,
        courseId: PREVIEW_COURSE_ID
      }));
      sandbox.stub(courseRepository, 'get').resolves({
        challenges: ['challenge_web_2', 'challenge_web_1'],
        competences: [COMPETENCE_ID]
      });
      sandbox.stub(challengeRepository, 'findByCompetence').resolves(challenges);
      sandbox.stub(skillRepository, 'findByCompetence').resolves(new Set([new Skill('@web1'), new Skill('@web2')]));
      sandbox.stub(assessmentAdapter, 'getAdaptedAssessment').returns({
        obtainedLevel: 2,
        displayedPixScore: 17
      });
      sandbox.stub(answerRepository, 'findByAssessment').resolves([wrongAnswerWeb2, correctAnswerWeb1]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve assessment from repository', () => {
      // when
      const promise = service.fetchAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        expect(assessmentRepository.get).to.have.been.calledWith(ASSESSMENT_ID);
      });
    });

    it('should return a rejected promise when the assessment does not exist', () => {
      // given
      assessmentRepository.get.resolves(null);

      // when
      const promise = service.fetchAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal(`Unable to find assessment with ID ${ASSESSMENT_ID}`);
      });
    });

    it('should rejects when acessing to the assessment is failing', () => {
      // given
      assessmentRepository.get.rejects(new Error('Access DB is failing'));

      // when
      const promise = service.fetchAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal('Access DB is failing');
      });
    });

    it('should return an assessment with an id and a courseId', () => {
      // when
      const promise = service.fetchAssessment(ASSESSMENT_ID);

      // then
      return promise
        .then(({ assessmentPix }) => {
          expect(assessmentPix.id).to.equal(ASSESSMENT_ID);
          expect(assessmentPix.courseId).to.deep.equal(PREVIEW_COURSE_ID);
        });
    });

    context('when the assessment is correctly retrieved', () => {
      it('should load answers for the assessment', () => {
        // when
        const promise = service.fetchAssessment(ASSESSMENT_ID);

        // then
        return promise
          .then(() => {
            sinon.assert.calledOnce(answerRepository.findByAssessment);
            sinon.assert.calledWithExactly(answerRepository.findByAssessment, ASSESSMENT_ID);
          });
      });

      context('when the assessement is a preview', () => {
        beforeEach(() => {
          answerRepository.findByAssessment.returns([correctAnswerWeb1]);
        });

        it('should return an assessment with an estimated level of 0, a pix-score of 0 and a success rate of 100', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise
            .then(({ assessmentPix, skills }) => {
              expect(assessmentPix.estimatedLevel).to.equal(0);
              expect(assessmentPix.pixScore).to.equal(0);
              expect(assessmentPix.successRate).to.equal(100);
              expect(skills).to.be.undefined;
            });
        });

        it('should not try to get course details', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise.then(() => {
            expect(courseRepository.get).not.to.have.been.called;
            expect(competenceRepository.get).not.to.have.been.called;
          });
        });
      });

      context('when the assessement is a certification', () => {
        beforeEach(() => {
          const assessmentFromCertif = new Assessment({ id: ASSESSMENT_ID, type: 'CERTIFICATION' });
          assessmentRepository.get.resolves(assessmentFromCertif);
        });
        it('should return an assessment with an estimated level of 0 and a pix-score of 0', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise
            .then(({ assessmentPix, skills }) => {
              expect(assessmentPix.estimatedLevel).to.equal(0);
              expect(assessmentPix.pixScore).to.equal(0);
              expect(skills).to.be.undefined;
            });
        });

        it('should not try to get course details', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise.then(() => {
            expect(courseRepository.get).not.to.have.been.called;
            expect(competenceRepository.get).not.to.have.been.called;
          });
        });
      });

      context('when the assessement is linked to a course', () => {
        beforeEach(() => {
          const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });
          assessmentRepository.get.resolves(assessmentFromPreview);
        });

        it('should load course details', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(courseRepository.get, COURSE_ID);
          });
        });

        context('when the course is not in adaptative mode', () => {
          it('should not load data to evaluate level and score', () => {
            // when
            const promise = service.fetchAssessment(ASSESSMENT_ID);

            // then
            return promise
              .then(() => {
                sinon.assert.notCalled(challengeRepository.findByCompetence);
                sinon.assert.notCalled(skillRepository.findByCompetence);
              });
          });

          it('should not load the linked competence', () => {
            // when
            const promise = service.fetchAssessment(ASSESSMENT_ID);

            // then
            return promise
              .then(() => {
                expect(competenceRepository.get).not.to.have.been.called;
              });
          });

          it('should return an assessment with an estimated level and a pix-score at 0', () => {
            // when
            const promise = service.fetchAssessment(ASSESSMENT_ID);

            // then
            return promise
              .then(({ assessmentPix, skills }) => {
                expect(assessmentPix.estimatedLevel).to.equal(0);
                expect(assessmentPix.pixScore).to.equal(0);
                expect(assessmentPix.successRate).to.equal(50);
                expect(skills).to.be.undefined;
              });
          });
        });

        context('when the course is an adaptive one', () => {

          beforeEach(() => {
            courseRepository.get.resolves({
              challenges: ['challenge_web_1', 'challenge_web_2'],
              competences: [COMPETENCE_ID],
              isAdaptive: true
            });
          });

          it('should load skills and challenges for the course', () => {
            // when
            const promise = service.fetchAssessment(ASSESSMENT_ID);

            // then
            return promise
              .then(() => {
                sinon.assert.calledWith(challengeRepository.findByCompetence, COMPETENCE);
                sinon.assert.calledWith(skillRepository.findByCompetence, COMPETENCE);
              });
          });

          it('should resolve the promise with a scored assessment and a skills calculated with assessmentAdapter', () => {
            // when
            const promise = service.fetchAssessment(ASSESSMENT_ID);

            // then
            return promise
              .then(({ assessmentPix, skills }) => {
                expect(assessmentPix.pixScore).to.equal(17);
                expect(assessmentPix.estimatedLevel).to.equal(2);
                expect(assessmentPix.successRate).to.equal(50);
                expect(skills.assessmentId).to.equal(ASSESSMENT_ID);
              });
          });
        });
      });
    });

    it('should detect Assessment created for preview Challenge and do not evaluate score', () => {
      // given
      const assessmentFromPreview = new Assessment({
        id: '1',
        courseId: PREVIEW_COURSE_ID
      });
      assessmentRepository.get.resolves(assessmentFromPreview);

      // when
      const promise = service.fetchAssessment(ASSESSMENT_ID);

      // then
      return promise
        .then(() => {
          sinon.assert.calledOnce(answerRepository.findByAssessment);
          sinon.assert.notCalled(courseRepository.get);
          sinon.assert.notCalled(challengeRepository.findByCompetence);
          sinon.assert.notCalled(skillRepository.findByCompetence);
        });
    });

    context('when we retrieved the assessment', () => {

      beforeEach(() => {
        assessmentRepository.get.resolves(assessment);
      });

      it('should return a rejected promise when the repository is on error', () => {
        // given
        courseRepository.get.rejects(new Error('Error from courseRepository'));

        // when
        const promise = service.fetchAssessment(ASSESSMENT_ID);

        // then
        return promise
          .then(() => sinon.assert.fail('Should not succeed'))
          .catch((error) => {
            expect(courseRepository.get).to.have.been.calledWithExactly(COURSE_ID);
            expect(error.message).to.equal('Error from courseRepository');
          });
      });

      it('should load answers for the assessment', () => {
        // when
        const promise = service.fetchAssessment(ASSESSMENT_ID);

        // then
        return promise.then(() => {
          expect(answerRepository.findByAssessment).to.have.been.calledOnce;
          expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(ASSESSMENT_ID);
        });
      });

      context('when we retrieved every challenge', () => {

        let firstFakeChallenge;
        let secondFakeChallenge;

        beforeEach(() => {
          const course = { challenges: ['challenge_web_1', 'challenge_web_2'], competences: [COMPETENCE_ID] };
          courseRepository.get.resolves(course);

          firstFakeChallenge = _buildChallenge(['@web1']);
          secondFakeChallenge = _buildChallenge(['@web2']);

          challengeRepository.findByCompetence.resolves([firstFakeChallenge, secondFakeChallenge]);
        });

        it('should resolve the promise with a scored assessment', () => {
          // when
          const promise = service.fetchAssessment(ASSESSMENT_ID);

          // then
          return promise
            .then(({ assessmentPix, skills }) => {
              expect(assessmentPix.estimatedLevel).to.equal(0);
              expect(assessmentPix.pixScore).to.equal(0);
              expect(assessmentPix.successRate).to.equal(50);
              expect(skills).to.be.undefined;
            });
        });
      });
    });
  });

  describe('#findByFilters', function() {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(assessmentRepository, 'findByFilters').resolves([]);
      sandbox.stub(certificationCourseRepository, 'get').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should find all the assessment with corresponding filters', function() {
      // given
      const filters = { courseId: 'courseId' };

      // when
      const promise = service.findByFilters(filters);

      // then
      return promise.then(() => {
        expect(assessmentRepository.findByFilters).to.have.been.called;
        expect(assessmentRepository.findByFilters).to.have.been.calledWith({ courseId: 'courseId' });
      });
    });

    context('when the assessment is a certification assessment', () => {

      it('should get the course associated to each assessment ', function() {
        // given
        const filters = { courseId: 'courseId' };
        const retrievedAssessments = [new Assessment({ id: 1, type: 'CERTIFICATION', courseId: 'courseId' })];
        assessmentRepository.findByFilters.resolves(retrievedAssessments);

        // when
        const promise = service.findByFilters(filters);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.get).to.have.been.calledOnce;
          expect(certificationCourseRepository.get).to.have.been.calledWith('courseId');
        });
      });

      it('should return one assessment with corresponding course', function() {
        // given
        const filters = { courseId: 'courseId' };
        const retrievedAssessments = [new Assessment({ id: 1, type: 'CERTIFICATION', courseId: 'courseId' })];
        assessmentRepository.findByFilters.resolves(retrievedAssessments);
        certificationCourseRepository.get.resolves({ id: 'courseId', status: 'started' });
        // when
        const promise = service.findByFilters(filters);

        // then
        return promise.then((assessments) => {
          expect(assessments[0]).to.be.instanceOf(Assessment);
          expect(assessments[0].id).to.be.deep.equal(1);
          expect(assessments[0].course).to.be.instanceOf(Course);
        });
      });
    });

    context('when there are different types of assessment', () => {

      it('should get the course associated to each assessment ', function() {
        // given
        const filters = { userId: 1 };
        const retrievedAssessments = [
          new Assessment({ id: 1, type: 'CERTIFICATION', courseId: '2' }),
          new Assessment({ id: 2, type: 'DEMO', courseId: 'recCourseId' })
        ];
        assessmentRepository.findByFilters.resolves(retrievedAssessments);

        // when
        const promise = service.findByFilters(filters);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.get).to.have.been.calledOnce;
          expect(certificationCourseRepository.get).to.have.been.calledWith('2');
        });
      });

      it('should return two assessment with corresponding course just for the certification assessment', function() {
        // given
        const filters = { userId: 1 };
        const retrievedAssessments = [
          new Assessment({ id: 1, type: 'CERTIFICATION', courseId: '2' }),
          new Assessment({ id: 2, type: 'DEMO', courseId: 'recCourseId' })
        ];
        assessmentRepository.findByFilters.resolves(retrievedAssessments);
        certificationCourseRepository.get.resolves({ id: 'courseId', status: 'started' });

        // when
        const promise = service.findByFilters(filters);

        // then
        return promise.then((assessments) => {
          expect(assessments[0]).to.be.instanceOf(Assessment);
          expect(assessments[1]).to.be.instanceOf(Assessment);
          expect(assessments[0].id).to.be.deep.equal(1);
          expect(assessments[1].id).to.be.deep.equal(2);
          expect(assessments[0].course).to.be.instanceOf(Course);
          expect(assessments[1].course).to.be.deep.equal(undefined);
        });
      });

    });
  });

  describe('#isAssessmentCompleted', () => {
    it('should return true when the assessment has a pixScore and an estimatedLevel', () => {
      // given
      const notCompletedAssessment = new Assessment({ id: '2752', estimatedLevel: 0, pixScore: 0 });

      // when
      const isCompleted = service.isAssessmentCompleted(notCompletedAssessment);

      // then
      expect(isCompleted).to.equal(true);
    });

    it('should return false when the assessment miss a pixScore', () => {
      // given
      const notCompletedAssessment = new Assessment({ id: '2752', estimatedLevel: 0 });

      // when
      const isCompleted = service.isAssessmentCompleted(notCompletedAssessment);

      // then
      expect(isCompleted).to.equal(false);
    });

    it('should return false when the assessment miss an estimatedLevel', () => {
      // given
      const notCompletedAssessment = new Assessment({ id: '2752', pixScore: 0 });

      // when
      const isCompleted = service.isAssessmentCompleted(notCompletedAssessment);

      // then
      expect(isCompleted).to.equal(false);
    });
  });

  describe('#isCertificationAssessment', () => {

    context('if assessment type is \'CERTIFICATION\'', () => {
      it('should return true', () => {
        // given
        const assessment = new Assessment({ type: 'CERTIFICATION' });

        // when
        const result = service.isCertificationAssessment(assessment);

        // then
        expect(result).to.be.true;
      });
    });

    context('if assessment type is different of \'CERTIFICATION\'', () => {
      it('should return false', () => {
        // given
        const assessment = new Assessment({ type: 'BRANDONE EST FORMIDABLE' });

        // when
        const result = service.isCertificationAssessment(assessment);

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#getNextChallengeForCertificationCourse', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(certificationChallengeRepository, 'getNonAnsweredChallengeByCourseId');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a challenge which was not answered (challenge with no associated answer)', function() {
      // given
      const assessment = new AssessmentBookshelf({ id: 'assessmentId', courseId: 'certifCourseId' });
      const challenge = new CertificationChallenge({ id: '1', challengeId: 'recA' });
      certificationChallengeRepository.getNonAnsweredChallengeByCourseId.resolves(challenge);

      // when
      const promise = service.getNextChallengeForCertificationCourse(assessment);

      // then
      return promise.then((nextChallenge) => {
        expect(nextChallenge).to.be.instanceOf(CertificationChallenge);
      });

    });

    it('should reject when there is no challenges to give anymore', function() {
      // given
      const assessment = new AssessmentBookshelf({ id: 'assessmentId', courseId: 'certifCourseId' });
      certificationChallengeRepository.getNonAnsweredChallengeByCourseId.rejects();

      // when
      const promise = service.getNextChallengeForCertificationCourse(assessment);

      // then
      expect(promise).to.be.rejected;
    });

  });

  describe('#isDemoAssessment', () => {
    it('should return true when the assessment is a DEMO', () => {
      // given
      const assessment = new Assessment({ type: 'DEMO' });

      // when
      const isDemoAssessment = service.isDemoAssessment(assessment);

      // then
      expect(isDemoAssessment).to.be.true;
    });

    it('should return true when the assessment is not defined', () => {
      // given
      const assessment = new Assessment({ type: '' });

      // when
      const isDemoAssessment = service.isDemoAssessment(assessment);

      // then
      expect(isDemoAssessment).to.be.false;
    });

  });

  describe('#isPlacementAssessment', () => {
    it('should return true when the assessment is a PLACEMENT', () => {
      // given
      const assessment = new Assessment({ type: 'PLACEMENT' });

      // when
      const isPlacementAssessment = service.isPlacementAssessment(assessment);

      // then
      expect(isPlacementAssessment).to.be.true;
    });

    it('should return true when the assessment is not defined', () => {
      // given
      const assessment = new Assessment({ type: '' });

      // when
      const isPlacementTest = service.isPlacementAssessment(assessment);

      // then
      expect(isPlacementTest).to.be.false;
    });

  });

});
