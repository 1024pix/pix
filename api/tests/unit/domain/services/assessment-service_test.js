const { describe, it, expect, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/assessment-service');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengeService = require('../../../../lib/domain/services/challenge-service');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

const Assessment = require('../../../../lib/domain/models/data/assessment');
const Challenge = require('../../../../lib/domain/models/referential/challenge');

const Answer = require('../../../../lib/domain/models/data/answer');

function _buildChallenge(knowledgeTags) {
  const challenge = new Challenge({ id: 'challenge_id' });
  challenge.knowledgeTags = knowledgeTags;
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


function _buildAssessment(estimatedLevel, pixScore, notAcquiredKnowledgeTags, acquiredKnowledgeTags, cid) {
  const assessment = new Assessment({ id: 'assessment_id' });
  assessment.set('estimatedLevel', estimatedLevel);
  assessment.set('pixScore', pixScore);
  assessment.set('notAcquiredKnowledgeTags', notAcquiredKnowledgeTags);
  assessment.set('acquiredKnowledgeTags', acquiredKnowledgeTags);
  assessment.cid = cid;
  return assessment;
}


describe('Unit | Domain | Services | assessment-service', function () {

  it('should exist', function () {
    expect(service).to.exist;
  });

  it('#getAssessmentNextChallengeId should exist', function () {
    expect(service.getAssessmentNextChallengeId).to.exist;
  });

  describe('#getAssessmentNextChallengeId', function () {

    it('Should return the first challenge if no currentChallengeId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: [ 'the_first_challenge' ] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), null).then(function (result) {
        expect(result).to.equal('the_first_challenge');
        courseRepository.get.restore();
        done();
      });

    });


    it('Should return the next challenge if currentChallengeId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: [ '1st_challenge', '2nd_challenge' ] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('22'), '1st_challenge').then(function (result) {
        expect(result).to.equal('2nd_challenge');
        courseRepository.get.restore();
        done();
      });

    });


    it('Should resolves to "null" if no assessment is given', function (done) {

      service.getAssessmentNextChallengeId().then(function (result) {
        expect(result).to.equal(null);
        done();
      });

    });


    it('Should resolves to "null" if no courseId is given', function (done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: [ '1st_challenge', '2nd_challenge' ] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse(), '1st_challenge').then(function (result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

    it('Should resolves to "null" if courseId starts with "null"', function (done) {

      sinon.stub(courseRepository, 'get').resolves({ challenges: [ '1st_challenge', '2nd_challenge' ] });

      service.getAssessmentNextChallengeId(_buildAssessmentForCourse('null22'), '1st_challenge').then(function (result) {
        expect(result).to.equal(null);
        courseRepository.get.restore();
        done();
      });

    });

  });

  describe('#getScoredAssessment', () => {

    it('checks sanity', () => {
      expect(service.getScoredAssessment).to.exist;
    });

    let getAssessmentStub;
    let getCourseStub;
    let getChallengeStub;
    let findByAssessmentStub;
    let getKnowledgeDataStub;

    const COURSE_ID = 123;
    const ASSESSMENT_ID = 836;
    const assessment = _buildAssessmentForCourse(COURSE_ID, ASSESSMENT_ID);

    const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok', ASSESSMENT_ID);
    const partialAnswerWeb1 = _buildAnswer('challenge_web_1', 'partial', ASSESSMENT_ID);

    const knowledgeData = {
      challengesById: {
        'challenge_web_1': _buildChallenge([ '@web1' ]),
        'challenge_web_2': _buildChallenge([ '@web2' ]),
        'challenge_url_1': _buildChallenge([ '@url1' ])
      },
      knowledgeTagSet: { '@web1': true, '@web2': true, '@url1': true },
      nbKnowledgeTagsByLevel: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
    };

    beforeEach(() => {
      getAssessmentStub = sinon.stub(assessmentRepository, 'get').returns(Promise.resolve(assessment));
      getCourseStub = sinon.stub(courseRepository, 'get').returns({ challenges: [] });
      getChallengeStub = sinon.stub(challengeRepository, 'get').returns();

      findByAssessmentStub = sinon.stub(answerRepository, 'findByAssessment')
        .returns(Promise.resolve([ correctAnswerWeb2, partialAnswerWeb1 ]));

      getKnowledgeDataStub = sinon.stub(challengeService, 'getKnowledgeData').returns(knowledgeData);
    });

    afterEach(() => {
      getAssessmentStub.restore();
      getCourseStub.restore();
      getChallengeStub.restore();
      findByAssessmentStub.restore();
      getKnowledgeDataStub.restore();
    });

    it('should retrieve assessment from repository', () => {
      // When
      let promise = service.getScoredAssessment(ASSESSMENT_ID);

      // Then
      return promise.then(() => {
        sinon.assert.calledWithExactly(getAssessmentStub, ASSESSMENT_ID);
      });
    });

    it('should return a rejected promise when something fails in the repository', () => {
      // Given
      const errorOnRepository = new Error();
      getAssessmentStub.returns(Promise.reject(errorOnRepository));

      // When
      let promise = service.getScoredAssessment(ASSESSMENT_ID);

      // Then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error).to.equal(errorOnRepository);
      });

    });

    it('should return a rejected promise when the assessment does not exist', () => {
      // Given
      getAssessmentStub.returns(Promise.resolve(null));

      // When
      let promise = service.getScoredAssessment(ASSESSMENT_ID);

      // Then
      return promise.then(() => {
        sinon.assert.fail('Should not succeed');
      }, (error) => {
        expect(error.message).to.equal(`Unable to find assessment with ID ${ASSESSMENT_ID}`);
      });
    });

    describe('when we retrieved the assessement', () => {

      beforeEach(() => {
        getAssessmentStub.returns(Promise.resolve(assessment));
      });

      it('should return a rejected promise when the repository is on error', () => {
        // Given
        getCourseStub.returns(Promise.reject(new Error('Error from courseRepository')));

        // When
        let promise = service.getScoredAssessment(ASSESSMENT_ID);

        // Then
        return promise
          .then(() => {
              sinon.assert.fail('Should not succeed');
            },
            (error) => {
              sinon.assert.calledWithExactly(getCourseStub, COURSE_ID);
              expect(error.message).to.equal('Error from courseRepository');
            });
      });

      it('should load answers for the assessment', () => {
        // When
        let promise = service.getScoredAssessment(ASSESSMENT_ID);

        // Then
        return promise
          .then(() => {
            sinon.assert.calledOnce(findByAssessmentStub);
            sinon.assert.calledWithExactly(findByAssessmentStub, ASSESSMENT_ID);
          });
      });

      describe('when we retrieved every challenge', () => {

        let firstFakeChallenge;
        let secondFakeChallenge;

        beforeEach(() => {
          let course = { challenges: [ 'challenge_web_1', 'challenge_web_2' ] };
          getCourseStub.returns(Promise.resolve(course));

          firstFakeChallenge = _buildChallenge([ '@web1' ]);
          secondFakeChallenge = _buildChallenge([ '@web2' ]);

          getChallengeStub.onFirstCall().returns(Promise.resolve(firstFakeChallenge));
          getChallengeStub.onSecondCall().returns(Promise.resolve(secondFakeChallenge));
        });

        it('should get knowledgeData each one', () => {
          // When
          let promise = service.getScoredAssessment(ASSESSMENT_ID);

          // Then
          return promise
            .then(() => {
              sinon.assert.calledOnce(getKnowledgeDataStub);
              sinon.assert.calledWithExactly(getKnowledgeDataStub, [ firstFakeChallenge, secondFakeChallenge ]);
            });
        });

        it('should resolve the promise with a scored assessment', () => {
          // When
          let promise = service.getScoredAssessment(ASSESSMENT_ID);

          // Then
          return promise
            .then((scoredAssessment) => {
              expect(scoredAssessment.get('id')).to.equal(ASSESSMENT_ID);
              expect(scoredAssessment.get('courseId')).to.deep.equal(COURSE_ID);
              expect(scoredAssessment.get('estimatedLevel')).to.exist;
              expect(scoredAssessment.get('pixScore')).to.exist;
            });
        });
      });
    });
  });

  describe('#_completeAssessmentWithScore', function () {

    const knowledgeData = {
      challengesById: {
        'challenge_web_1': _buildChallenge([ '@web1' ]),
        'challenge_web_2': _buildChallenge([ '@web2' ]),
        'challenge_url_1': _buildChallenge([ '@url1' ]),
        'challenge_social_1': _buildChallenge([ '@soc1' ]),
      },
      knowledgeTagSet: { '@web1': true, '@web2': true, '@url1': true },
      nbKnowledgeTagsByLevel: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
    };

    const assessment = new Assessment({ id: 'assessment_id' });

    const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ok');
    const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok');
    const partialAnswerWeb1 = _buildAnswer('challenge_web_1', 'partial');
    const incorrectAnswerUrl1 = _buildAnswer('challenge_url_1', 'ko');
    const correctAnswerUrl1 = _buildAnswer('challenge_url_1', 'ok');

    [
      {
        answers: [ correctAnswerWeb2, incorrectAnswerUrl1 ],
        title: 'web2 correct, url1 incorrect',
        score: 12,
        level: 1,
        acquired: [ '@web2', '@web1' ],
        notAcquired: [ '@url1' ]
      },
      {
        answers: [ partialAnswerWeb1, correctAnswerUrl1 ],
        title: 'web1 partial, url1 correct',
        score: 4,
        level: 0,
        acquired: [ '@url1' ],
        notAcquired: [ '@web1', '@web2' ]
      },
      {
        answers: [ correctAnswerWeb2, correctAnswerUrl1 ],
        title: 'web2 correct, url1 correct',
        score: 16,
        level: 2,
        acquired: [ '@web2', '@web1', '@url1' ],
        notAcquired: []
      },
      {
        answers: [ correctAnswerWeb1, correctAnswerWeb2 ],
        title: 'web1 correct, web2 correct',
        score: 12,
        level: 1,
        acquired: [ '@web1', '@web2' ],
        notAcquired: []
      }
    ]
      .forEach(pattern => {
        it(`should compute ${pattern.score} and level ${pattern.level} when user pattern is ${pattern.title}`, function () {
          // When
          const scoredAssessment = service._completeAssessmentWithScore(assessment, pattern.answers, knowledgeData);

          // Then
          const expectedScoredAssessment = _buildAssessment(pattern.level, pattern.score, pattern.notAcquired, pattern.acquired, scoredAssessment.cid);
          expect(scoredAssessment).to.deep.equal(expectedScoredAssessment);
        });
      });

  });

});
