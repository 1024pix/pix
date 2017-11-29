const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');
const assessmentAdapter = require('../../../../lib/infrastructure/adapters/assessment-adapter');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

const Assessment = require('../../../../lib/domain/models/data/assessment');
const Challenge = require('../../../../lib/domain/models/Challenge');

const Answer = require('../../../../lib/domain/models/data/answer');
const Skill = require('../../../../lib/cat/skill');

const { NotElligibleToScoringError } = require('../../../../lib/domain/errors');

function _buildChallenge(challengeId, knowledgeTags) {
  const challenge = new Challenge();
  challenge.id = challengeId;
  challenge.skills = knowledgeTags;
  return challenge;
}

function _buildAssessmentForCourse(courseId, assessmentId = 'assessment_id') {
  const assessment = new Assessment({ id: assessmentId });
  if (courseId) {
    assessment.set('courseId', courseId);
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

describe('Unit | Domain | Services | assessment-service', function() {

  beforeEach(() => {
    sinon.stub(competenceRepository, 'get');
  });

  afterEach(() => {
    competenceRepository.get.restore();
  });

  describe('#getAssessmentNextChallengeId', function() {

    it('Should return the first challenge if no currentChallengeId is given', function(done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: ['the_first_challenge'] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), null).then(function(result) {
        expect(result).to.equal('the_first_challenge');
        courseRepository.get.restore();
        done();
      });

    });

    it('Should return the next challenge if currentChallengeId is given', function(done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: ['1st_challenge', '2nd_challenge'] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), '1st_challenge').then(function(result) {
        expect(result).to.equal('2nd_challenge');
        courseRepository.get.restore();
        done();
      });

    });

    it('Should resolves to "null" if no assessment is given', function(done) {

      service.getAssessmentNextChallengeId().then(function(result) {
        expect(result).to.equal(null);
        done();
      });

    });

    it('Should resolves to "null" if no courseId is given', function(done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: ['1st_challenge', '2nd_challenge'] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse(), '1st_challenge').then(function(result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

    it('Should resolves to "null" if courseId starts with "null"', function(done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: ['1st_challenge', '2nd_challenge'] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('null22'), '1st_challenge').then(function(result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

  });

  describe('#getScoredAssessment', () => {

    const COURSE_ID = 123;
    const ASSESSMENT_ID = 836;
    const assessment = _buildAssessmentForCourse(COURSE_ID, ASSESSMENT_ID);

    const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok', ASSESSMENT_ID);
    const partialAnswerWeb1 = _buildAnswer('challenge_web_1', 'partial', ASSESSMENT_ID);

    const challenges = [
      _buildChallenge('challenge_web_1', ['@web1']),
      _buildChallenge('challenge_web_2', ['@web2'])
    ];

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {

      sandbox.stub(assessmentRepository, 'get').resolves(assessment);
      sandbox.stub(courseRepository, 'get').resolves({
        challenges: ['challenge_web_2', 'challenge_web_1'],
        competences: ['competence_id']
      });
      sandbox.stub(challengeRepository, 'findByCompetence').resolves(challenges);
      sandbox.stub(skillRepository, 'findByCompetence').resolves(new Set());
      sandbox.stub(assessmentAdapter, 'getAdaptedAssessment');
      sandbox.stub(answerRepository, 'findByAssessment').resolves([correctAnswerWeb2, partialAnswerWeb1]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve assessment from repository', () => {
      // when
      const promise = service.getScoredAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        expect(assessmentRepository.get).to.have.been.calledWith(ASSESSMENT_ID);
      });
    });

    it('should return a rejected promise when the assessment does not exist', () => {
      // given
      assessmentRepository.get.resolves(null);

      // when
      const promise = service.getScoredAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal(`Unable to find assessment with ID ${ASSESSMENT_ID}`);
      });
    });

    it('should rejects when assessment is in preview mode', function() {
      // given
      const assessment = {
        get() {
          return 'nullCourseId';
        }
      };
      assessmentRepository.get.resolves(assessment);

      // when
      const promise = service.getScoredAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error).to.be.instanceOf(NotElligibleToScoringError);
        expect(error.message).to.equal(`Assessment with ID ${ASSESSMENT_ID} is a preview Challenge`);
      });
    });

    it('should return a rejected promise when something fails in the repository', () => {
      // given
      const errorOnRepository = new Error();
      assessmentRepository.get.rejects(errorOnRepository);

      // when
      const promise = service.getScoredAssessment(ASSESSMENT_ID);

      // then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error).to.equal(errorOnRepository);
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
        const promise = service.getScoredAssessment(ASSESSMENT_ID);

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
        const promise = service.getScoredAssessment(ASSESSMENT_ID);

        // then
        return promise.then(() => {
          expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(ASSESSMENT_ID);
        });
      });

      context('when we retrieved every challenge', () => {

        let firstFakeChallenge;
        let secondFakeChallenge;

        beforeEach(() => {
          const course = { challenges: ['challenge_web_1', 'challenge_web_2'], competences: ['competence_id'] };
          courseRepository.get.resolves(course);

          firstFakeChallenge = _buildChallenge(['@web1']);
          secondFakeChallenge = _buildChallenge(['@web2']);

          challengeRepository.findByCompetence.resolves([firstFakeChallenge, secondFakeChallenge]);
        });

        it('should resolve the promise with a scored assessment', () => {
          // when
          const promise = service.getScoredAssessment(ASSESSMENT_ID);

          // then
          return promise
            .then(({ assessmentPix, skills }) => {
              expect(assessmentPix.get('id')).to.equal(ASSESSMENT_ID);
              expect(assessmentPix.get('courseId')).to.deep.equal(COURSE_ID);
              expect(assessmentPix.get('estimatedLevel')).to.equal(0);
              expect(assessmentPix.get('pixScore')).to.equal(0);
              expect(assessmentPix.get('successRate')).to.equal(50);expect(skills).to.be.undefined;
            });
        });

        it('should resolve the promise with a scored assessment and a skills', () => {
          // given
          const course = {
            challenges: ['challenge_web_1', 'challenge_web_2'],
            competences: ['competence_id'],
            isAdaptive: true
          };
          courseRepository.get.resolves(course);
          const expectedValitedSkills = _generateValidatedSkills();
          const expectedFailedSkills = _generateFailedSkills();

          assessmentAdapter.getAdaptedAssessment.returns({
            validatedSkills: _generateValidatedSkills(),
            failedSkills: _generateFailedSkills(),
            obtainedLevel: 50,
            displayedPixScore: 13
          });

          // when
          const promise = service.getScoredAssessment(ASSESSMENT_ID);

          // then
          return promise.then(({ assessmentPix, skills }) => {
            expect(assessmentPix.get('id')).to.equal(ASSESSMENT_ID);
            expect(assessmentPix.get('courseId')).to.deep.equal(COURSE_ID);
            expect(assessmentPix.get('estimatedLevel')).to.equal(50);
            expect(assessmentPix.get('pixScore')).to.equal(13);
            expect(skills.assessmentId).to.equal(ASSESSMENT_ID);
            expect([...skills.validatedSkills]).to.deep.equal([...expectedValitedSkills]);
            expect([...skills.failedSkills]).to.deep.equal([...expectedFailedSkills]);
          });
        });

      });
    });
  });

  describe('#createCertificationAssessmentForUser', () => {
    beforeEach(() => {
      sinon.stub(assessmentRepository, 'save').resolves();
    });
    afterEach(() => {
      assessmentRepository.save.restore();
    });
    it('should save an assessment with CERTIFICATION type', () => {
      // given
      const certificationCourse = { id: 'certificationId' };
      const userId = 'userId';
      const expectedAssessment = {
        courseId: certificationCourse.id,
        type: 'CERTIFICATION',
        userId: userId
      };
      // when

      const promise = service.createCertificationAssessmentForUser(certificationCourse, userId);
      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.save);
        sinon.assert.calledWith(assessmentRepository.save, expectedAssessment);
      });
    });
  });

});

function _generateValidatedSkills() {
  const url2 = new Skill('@url2');
  const web3 = new Skill('@web3');
  const skill = new Set();
  skill.add(url2);
  skill.add(web3);

  return skill;
}

function _generateFailedSkills() {
  const recherche2 = new Skill('@recherch2');
  const securite3 = new Skill('@securite3');
  const skill = new Set();
  skill.add(recherche2);
  skill.add(securite3);

  return skill;
}
