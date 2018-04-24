const { expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');
const certificationService = require('../../../../lib/domain/services/certification-service');
const assessmentAdapter = require('../../../../lib/infrastructure/adapters/assessment-adapter');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Course = require('../../../../lib/domain/models/Course');
const Answer = require('../../../../lib/domain/models/Answer');
const Challenge = require('../../../../lib/domain/models/Challenge');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

const Skill = require('../../../../lib/domain/models/Skill');
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
  return new Answer({
    id: 'answer_id',
    challengeId: challengeId,
    assessmentId: assessmentId,
    result: result
  });
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
      _buildChallenge('challenge_web_1', [new Skill({ name: '@web1' })]),
      _buildChallenge('challenge_web_2', [new Skill({ name: '@web2' })])
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
      sandbox.stub(skillRepository, 'findByCompetence').resolves(new Set([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]));
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

  describe('#getSkills', () => {

    const COURSE_ID = 123;
    const PREVIEW_COURSE_ID = 'nullfec89bd5-a706-419b-a6d2-f8805e708ace';

    const COMPETENCE_ID = 'competence_id';
    const COMPETENCE = { id: COMPETENCE_ID };
    const ASSESSMENT_ID = 836;

    const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ok', ASSESSMENT_ID);
    const wrongAnswerWeb2 = _buildAnswer('challenge_web_2', 'ko', ASSESSMENT_ID);

    const challenges = [
      _buildChallenge('challenge_web_1', [new Skill({ name: '@web1' })]),
      _buildChallenge('challenge_web_2', [new Skill({ name: '@web2' })])
    ];

    const sandbox = sinon.sandbox.create();
    let assessment;
    beforeEach(() => {
      assessment = new Assessment({
        id: ASSESSMENT_ID,
        courseId: PREVIEW_COURSE_ID
      });
      competenceRepository.get.resolves(COMPETENCE);
      sandbox.stub(courseRepository, 'get').resolves({
        challenges: ['challenge_web_2', 'challenge_web_1'],
        competences: [COMPETENCE_ID]
      });
      sandbox.stub(challengeRepository, 'findByCompetence').resolves(challenges);
      sandbox.stub(skillRepository, 'findByCompetence').resolves(new Set([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]));
      sandbox.stub(assessmentAdapter, 'getAdaptedAssessment').returns({
        obtainedLevel: 2,
        displayedPixScore: 17,
        validatedSkills: ['@web1'],
        failedSkills: ['@web2']
      });
      sandbox.stub(answerRepository, 'findByAssessment').resolves([wrongAnswerWeb2, correctAnswerWeb1]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a rejected promise when the assessment does not exist', () => {
      // when
      const promise = service.getSkills(null);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal('Unable to getSkills without assessment');
      });
    });

    context('when the assessment is correctly retrieved', () => {

      context('when the assessement is a preview', () => {
        beforeEach(() => {
          answerRepository.findByAssessment.returns([correctAnswerWeb1]);
        });

        it('should return an empty list of skills', () => {
          // when
          const promise = service.getSkills(assessment);

          // then
          return promise
            .then((skills) => {
              expect(skills).to.have.property('validatedSkills').and.to.deep.equal([]);
              expect(skills).to.have.property('failedSkills').and.to.deep.equal([]);
            });
        });

        it('should not try to get course details', () => {
          // when
          const promise = service.getSkills(assessment);

          // then
          return promise.then(() => {
            expect(courseRepository.get).not.to.have.been.called;
            expect(competenceRepository.get).not.to.have.been.called;
          });
        });
      });

      context('when the assessement is a certification', () => {

        it('should not try to get course details', () => {
          // given
          const assessmentFromCertif = new Assessment({ id: ASSESSMENT_ID, type: 'CERTIFICATION' });

          // when
          const promise = service.getSkills(assessmentFromCertif);

          // then
          return promise.then(() => {
            expect(courseRepository.get).not.to.have.been.called;
            expect(competenceRepository.get).not.to.have.been.called;
          });
        });
      });

      context('when the assessement is linked to a course', () => {
        it('should load course details', () => {
          // given
          const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });

          // when
          const promise = service.getSkills(assessmentFromPreview);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(courseRepository.get, COURSE_ID);
          });
        });

        context('when the course is not in adaptative mode', () => {
          it('should not load data to evaluate level and score', () => {
            // given
            const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });

            // when
            const promise = service.getSkills(assessmentFromPreview);

            // then
            return promise
              .then(() => {
                sinon.assert.notCalled(challengeRepository.findByCompetence);
                sinon.assert.notCalled(skillRepository.findByCompetence);
              });
          });

          it('should not load the linked competence', () => {
            // given
            const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });

            // when
            const promise = service.getSkills(assessmentFromPreview);

            // then
            return promise
              .then(() => {
                expect(competenceRepository.get).not.to.have.been.called;
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
            // given
            const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });

            // when
            const promise = service.getSkills(assessmentFromPreview);

            // then
            return promise
              .then(() => {
                sinon.assert.calledWith(challengeRepository.findByCompetence, COMPETENCE);
                sinon.assert.calledWith(skillRepository.findByCompetence, COMPETENCE);
              });
          });

          it('should resolve the promise with skills calculated with assessmentAdapter', () => {
            // given
            const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });

            // when
            const promise = service.getSkills(assessmentFromPreview);

            // then
            return promise
              .then((skills) => {
                expect(skills).to.have.property('validatedSkills').and.to.deep.equal(['@web1']);
                expect(skills).to.have.property('failedSkills').and.to.deep.equal(['@web2']);
              });
          });
        });
      });
    });

    it('should detect Assessment created for preview Challenge and do not search for course, challenges or skills', () => {
      // given
      const assessmentFromPreview = new Assessment({
        id: '1',
        courseId: PREVIEW_COURSE_ID
      });
      // when
      const promise = service.getSkills(assessmentFromPreview);

      // then
      return promise
        .then(() => {
          sinon.assert.notCalled(answerRepository.findByAssessment);
          sinon.assert.notCalled(courseRepository.get);
          sinon.assert.notCalled(challengeRepository.findByCompetence);
          sinon.assert.notCalled(skillRepository.findByCompetence);
        });
    });

  });

  describe('#getScoreAndLevel', () => {

    const COURSE_ID = 123;
    const PREVIEW_COURSE_ID = 'nullfec89bd5-a706-419b-a6d2-f8805e708ace';

    const COMPETENCE_ID = 'competence_id';
    const COMPETENCE = { id: COMPETENCE_ID };

    const ASSESSMENT_ID = 836;

    const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ok', ASSESSMENT_ID);
    const wrongAnswerWeb2 = _buildAnswer('challenge_web_2', 'ko', ASSESSMENT_ID);

    const challenges = [
      _buildChallenge('challenge_web_1', [new Skill({ name: '@web1' })]),
      _buildChallenge('challenge_web_2', [new Skill({ name: '@web2' })])
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
      sandbox.stub(skillRepository, 'findByCompetence').resolves(new Set([new Skill({ name: '@web1' }), new Skill({ name: '@web2' })]));
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
      const promise = service.getScoreAndLevel(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        expect(assessmentRepository.get).to.have.been.calledWith(ASSESSMENT_ID);
      });
    });

    it('should rejects when acessing to the assessment is failing', () => {
      // given
      assessmentRepository.get.rejects(new Error('Access DB is failing'));

      // when
      const promise = service.getScoreAndLevel(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal('Access DB is failing');
      });
    });

    it('should return a level and pixScore', () => {
      // when
      const promise = service.getScoreAndLevel(ASSESSMENT_ID);

      // then
      return promise
        .then(({ estimatedLevel, pixScore }) => {
          expect(estimatedLevel).to.equal(0);
          expect(pixScore).to.equal(0);
        });
    });

    it('should load answers for the assessment', () => {
      // when
      const promise = service.getScoreAndLevel(ASSESSMENT_ID);

      // then
      return promise
        .then(() => {
          sinon.assert.calledOnce(answerRepository.findByAssessment);
          sinon.assert.calledWithExactly(answerRepository.findByAssessment, ASSESSMENT_ID);
        });
    });

    context('when the assessement is linked to a course', () => {
      beforeEach(() => {
        const assessmentFromPreview = new Assessment({ id: ASSESSMENT_ID, courseId: COURSE_ID });
        assessmentRepository.get.resolves(assessmentFromPreview);
      });

      it('should load course details', () => {
        // when
        const promise = service.getScoreAndLevel(ASSESSMENT_ID);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(courseRepository.get, COURSE_ID);
        });
      });

      context('when the course is not in adaptative mode', () => {
        it('should not load data to evaluate level and score', () => {
          // when
          const promise = service.getScoreAndLevel(ASSESSMENT_ID);

          // then
          return promise
            .then(() => {
              sinon.assert.notCalled(challengeRepository.findByCompetence);
              sinon.assert.notCalled(skillRepository.findByCompetence);
            });
        });

        it('should not load the linked competence', () => {
          // when
          const promise = service.getScoreAndLevel(ASSESSMENT_ID);

          // then
          return promise
            .then(() => {
              expect(competenceRepository.get).not.to.have.been.called;
            });
        });

        it('should return the level and a pix-score at 0', () => {
          // when
          const promise = service.getScoreAndLevel(ASSESSMENT_ID);

          // then
          return promise
            .then(({ estimatedLevel, pixScore }) => {
              expect(estimatedLevel).to.equal(0);
              expect(pixScore).to.equal(0);
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
          const promise = service.getScoreAndLevel(ASSESSMENT_ID);

          // then
          return promise
            .then(() => {
              sinon.assert.calledWith(challengeRepository.findByCompetence, COMPETENCE);
              sinon.assert.calledWith(skillRepository.findByCompetence, COMPETENCE);
            });
        });

        it('should resolve the level and the score', () => {
          // when
          const promise = service.getScoreAndLevel(ASSESSMENT_ID);

          // then
          return promise
            .then(({ estimatedLevel, pixScore }) => {
              expect(estimatedLevel).to.equal(2);
              expect(pixScore).to.equal(17);
            });
        });
      });
    });
  });

  describe('#getCompetenceMarks', () => {

    context('when assessment is a Certification', () => {
      const assessment = new Assessment({ id: 1, type: 'CERTIFICATION' });

      const sandbox = sinon.sandbox.create();

      beforeEach(() => {
        sandbox.stub(competenceRepository, 'list').resolves([
          { index:'1.1', area: { code: 'area_1' } },
          { index:'1.2', area: { code: 'area_2' } }
        ]);
        sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves({
          competencesWithMark: [{
            index: '1.1',
            obtainedLevel: 2,
            obtainedScore: 18,
          },
          {
            index: '1.2',
            obtainedLevel: 3,
            obtainedScore: 28,
          }]
        });
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should get a list of all competence', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {
          expect(competenceRepository.list).to.have.been.calledOnce;
        });
      });

      it('should call certificationService to calculate the certification Result', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {
          expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledOnce;
          expect(certificationService.calculateCertificationResultByAssessmentId).to.have.been.calledWithExactly(1);
        });
      });

      it('should return a list of Competence Marks with all informations', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then((result) => {
          expect(result).to.have.lengthOf(2);

          expect(result[0]).to.be.an.instanceOf(CompetenceMark);
          expect(result[0].level).to.deep.equal(2);
          expect(result[0].score).to.deep.equal(18);
          expect(result[0].area_code).to.deep.equal('area_1');
          expect(result[0].competence_code).to.deep.equal('1.1');

          expect(result[1]).to.be.an.instanceOf(CompetenceMark);
          expect(result[1].level).to.deep.equal(3);
          expect(result[1].score).to.deep.equal(28);
          expect(result[1].area_code).to.deep.equal('area_2');
          expect(result[1].competence_code).to.deep.equal('1.2');
        });
      });
    });

    context('when assessment is a Placement', () => {
      const courseId = 'courseId';
      const assessment = new Assessment({ id: 1, type: 'PLACEMENT', courseId, estimatedLevel: 2, pixScore: 18 });
      const competence = { area: { code: 'comp_code' }, index: '1.1' };

      const sandbox = sinon.sandbox.create();

      beforeEach(() => {
        sandbox.stub(courseRepository, 'get').resolves(new Course({
          competences: ['1.1'],
        }));
        sandbox.stub(service, 'getScoreAndLevel').resolves({
          estimatedLevel: 2, pixScore: 18
        });
        competenceRepository.get.resolves(competence);
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should retrieved course by courseId', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {
          expect(courseRepository.get).to.have.been.calledOnce;
          expect(courseRepository.get).to.have.been.calledWithExactly(courseId);
        });

      });

      it('should get competence tested by assessment', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then(() => {

          expect(competenceRepository.get).to.have.been.calledOnce;
          expect(competenceRepository.get).to.have.been.calledWithExactly('1.1');
        });

      });

      it('should return a Competence Marks with level, score, area and competence code', () => {
        // when
        const promise = service.getCompetenceMarks(assessment);

        // then
        return promise.then((result) => {

          expect(result[0]).to.be.an.instanceOf(CompetenceMark);
          expect(result).to.have.lengthOf(1);
          expect(result[0].level).to.deep.equal(2);
          expect(result[0].score).to.deep.equal(18);
          expect(result[0].area_code).to.deep.equal('comp_code');
          expect(result[0].competence_code).to.deep.equal('1.1');
        });
      });
    });

    context('when assessment is not a Certification/Placement', () => {

      it('should return an empty list', () => {
        // given
        const assessment = new Assessment({ id: 1, type: 'DEMO' });

        // when
        const result = service.getCompetenceMarks(assessment);

        // then
        expect(result).to.deep.equal([]);
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

  describe('#computeMarks', () => {

    const sandbox = sinon.sandbox.create();
    const assessmentResultId = '2413';
    const competenceMark1 = new CompetenceMark({
      level: 2,
      score: 18,
      area_code: 'area_1',
      competence_code: '1.1',
      assessmentResultId: assessmentResultId
    });
    const competenceMark2 = new CompetenceMark({
      level: 3,
      score: 28,
      area_code: 'area_2',
      competence_code: '1.2',
      assessmentResultId: assessmentResultId
    });

    beforeEach(() => {
      sandbox.stub(competenceRepository, 'list').resolves([
        { index:'1.1', area: { code: 'area_1' } },
        { index:'1.2', area: { code: 'area_2' } }
      ]);

      sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves({
        competencesWithMark: [{
          index: '1.1',
          obtainedLevel: 2,
          obtainedScore: 18,
        },
        {
          index: '1.2',
          obtainedLevel: 3,
          obtainedScore: 28,
        }]
      });

      sandbox.stub(competenceMarkRepository, 'save').resolves(competenceMark1, competenceMark2);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should create and saved the competence marks for one given assessment', () => {
      // given
      const assessmentId = '1342';

      // when
      const promise = service.computeMarks(assessmentId, assessmentResultId);

      // then
      return promise.then((savedMarks) => {
        expect(competenceMarkRepository.save).to.have.been.calledTwice;
        expect(savedMarks).to.have.lengthOf(2);
        expect(savedMarks).to.contains(competenceMark1, competenceMark2);

        expect(competenceMarkRepository.save.firstCall.args[0]).to.deep.equal(competenceMark1);
        expect(competenceMarkRepository.save.secondCall.args[0]).to.deep.equal(competenceMark2);
      });
    });

  });

});
