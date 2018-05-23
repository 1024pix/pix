const _ = require('lodash');
const { expect, sinon, factory } = require('../../test-helper');
const CatAnswer = require('../../../lib/cat/answer');
const CatAssessment = require('../../../lib/cat/assessment');
const CatChallenge = require('../../../lib/cat/challenge');
const CatCourse = require('../../../lib/cat/course');
const CatSkill = require('../../../lib/cat/skill');

const AnswerStatus = require('../../../lib/domain/models/AnswerStatus');

describe('Unit | Model | Assessment', function() {

  describe('#_probaOfCorrectAnswer()', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment._probaOfCorrectAnswer).to.exist;
    });

    it('should return 1/2 if difficulty equals level', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // when
      const proba = assessment._probaOfCorrectAnswer(3, 3);

      // then
      expect(proba).to.equal(0.5);
    });

    it('should return something lesser than 1/2 if difficulty is higher than level', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // when
      const proba = assessment._probaOfCorrectAnswer(3, 4);

      // then
      expect(proba).to.be.below(0.5);
    });
  });

  describe('#_computeLikelihood()', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment._computeLikelihood).to.exist;
    });

    it('should return likelihood values for different levels', function() {
      // given
      const web4 = new CatSkill('web4');
      const web5 = new CatSkill('web5');
      const url1 = new CatSkill('url1');
      const ch1 = new CatChallenge('a', 'validé', [web4]);
      const ch2 = new CatChallenge('b', 'validé', [web5]);
      const ch3 = new CatChallenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const answers = [answer1, answer2];
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, answers);

      // when
      const likelihoodValues = [3.5, 4.5, 5.5].map(level => assessment._computeLikelihood(level, assessment.answers));

      // then
      expect(likelihoodValues).to.deep.equal([-0.4400338073954983, -0.06487123739065036, -0.6183891934859586]);
    });

    it('should return negative values every time', function() {
      // given
      const web4 = new CatSkill('web4');
      const web5 = new CatSkill('web5');
      const url1 = new CatSkill('url1');
      const ch1 = new CatChallenge('a', 'validé', [web4]);
      const ch2 = new CatChallenge('b', 'validé', [web5]);
      const ch3 = new CatChallenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const answers = [answer1, answer2];
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, answers);

      // when
      const likelihoodValues = [1.2, 3.4, 5.6].map(level => assessment._computeLikelihood(level, assessment.answers));

      // then
      likelihoodValues.forEach(likelihoodValue => expect(likelihoodValue).to.be.below(0));
    });
  });

  describe('#_getPredictedLevel', function() {

    it('should return 2 if user did not provide any answers so far', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment._getPredictedLevel()).to.be.equal(2);
    });

    it('should return 4.5 if user answered correctly a question of maxDifficulty 4 but failed at 5', function() {
      // given
      const web4 = new CatSkill('web4');
      const web5 = new CatSkill('web5');
      const url1 = new CatSkill('url1');
      const ch1 = new CatChallenge('a', 'validé', [web4]);
      const ch2 = new CatChallenge('b', 'validé', [web5]);
      const ch3 = new CatChallenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const answers = [answer1, answer2];
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, answers);

      // when
      const predictedLevel = assessment._getPredictedLevel();

      // then
      expect(predictedLevel).to.equal(4.5);
    });
  });

  describe('#validatedSkills', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.validatedSkills).to.exist;
    });

    it('should return [web1, web3] if the user answered correctly a question that requires web3', function() {
      // given
      const web1 = new CatSkill('web1');
      const web3 = new CatSkill('web3');
      const url3 = new CatSkill('url3');
      const url4 = new CatSkill('url4');
      const url5 = new CatSkill('url5');
      const url6 = new CatSkill('url6');
      const ch1 = new CatChallenge('a', 'validé', [web3]);
      const ch2 = new CatChallenge('b', 'validé', [web1, web3, url3, url4, url5, url6]);
      const course = new CatCourse([ch1, ch2]);
      const answer = new CatAnswer(ch1, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect([...assessment.validatedSkills]).to.be.deep.equal([web1, web3]);
    });

    it('should not have the same skill validated twice', function() {
      // given
      const web3forChallengeOne = new CatSkill('web3');
      const web3forChallengeTwo = new CatSkill('web3');
      const url3 = new CatSkill('url3');
      const ch1 = new CatChallenge('a', 'validé', [web3forChallengeOne]);
      const ch2 = new CatChallenge('b', 'validé', [url3, web3forChallengeTwo]);
      const course = new CatCourse([ch1, ch2]);
      const answer = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer, answer2]);

      // then
      expect(assessment.validatedSkills).to.be.deep.equal([web3forChallengeOne, url3]);
    });

    it('should not try to add skill from undefined challenge', function() {
      // given
      const web3forChallengeOne = new CatSkill('web3');
      const ch1 = new CatChallenge('a', 'validé', [web3forChallengeOne]);
      const course = new CatCourse([ch1]);
      const answer = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(undefined, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer, answer2]);

      // then
      expect([...assessment.validatedSkills]).to.be.deep.equal([web3forChallengeOne]);
    });
  });

  describe('#failedSkills', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.failedSkills).to.exist;
    });

    it('should return [web1, web2, web3, url5, url6, url8] if the user fails a question that requires web1 and url5', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const url3 = new CatSkill('url3');
      const url4 = new CatSkill('url4');
      const url5 = new CatSkill('url5');
      const url6 = new CatSkill('url6');
      const url8 = new CatSkill('url8');
      const ch1 = new CatChallenge('a', 'validé', [web1, url5]);
      const ch2 = new CatChallenge('b', 'validé', [web2, web3, url3, url4, url6, url8]);
      const course = new CatCourse([ch1, ch2]);
      const answer = new CatAnswer(ch1, AnswerStatus.KO);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect([...assessment.failedSkills]).to.be.deep.equal([web1, web2, web3, url5, url6, url8]);
    });

    it('should not try to add skill from undefined challenge', function() {
      // given
      const web3forChallengeOne = new CatSkill('web3');
      const ch1 = new CatChallenge('a', 'validé', [web3forChallengeOne]);
      const course = new CatCourse([ch1]);
      const answer = new CatAnswer(ch1, AnswerStatus.KO);
      const answer2 = new CatAnswer(undefined, AnswerStatus.KO);
      const assessment = new CatAssessment(course, [answer, answer2]);

      // then
      expect([...assessment.failedSkills]).to.be.deep.equal([web3forChallengeOne]);
    });

    it('should return [web3, web4] when challenge requiring web3, web4 was skipped', () => {
      // given
      const web3 = new CatSkill('web3');
      const web4 = new CatSkill('web4');
      const ch1 = new CatChallenge('a', 'validé', [web3, web4]);
      const course = new CatCourse([ch1]);

      // when
      const answer = new CatAnswer(ch1, AnswerStatus.SKIPPED);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect([...assessment.failedSkills]).to.be.deep.equal([web3, web4]);
    });

  });

  describe('#assessedSkills', function() {

    it('should return empty array when no answers', function() {
      // given
      const assessment = factory.buildCatAssessment({ answers: [] });

      // when
      const result = assessment.assessedSkills;

      // then
      expect(result).to.be.empty;
    });

    it('should return a validated skill and easiers skills when we answered right', function() {
      // given
      // XXX currently tubes are computed from the skills of the challenges,
      // we need a challenge with skill level 1 so that it appears in `assessment.assessedSkills`
      const [s1, s2] = factory.buildCatTube({ max: 2 });
      const ch1 = factory.buildCatChallenge({
        skills: [s1],
      });
      const ch2 = factory.buildCatChallenge({
        skills: [s2],
      });
      const assessment = factory.buildCatAssessment({
        course: factory.buildCatCourse({
          challenges: [ch1, ch2],
          competenceSkills: [s1, s2],
        }),
        answers: [factory.buildCatAnswer({ challenge: ch2, result: 'ok' })],
      });

      // when
      const result = assessment.assessedSkills;

      // then
      expect(result).to.deep.equal([s1, s2]);
    });

    it('should return the union of failed and validated skills', function() {
      // given
      let tube1, tube2;
      const [s1, s2] = tube1 = factory.buildCatTube({ max: 3 });
      const [t1, t2, t3] = tube2 = factory.buildCatTube({ max: 3 });
      const ch1 = factory.buildCatChallenge({ skills: [s1] });
      const ch2 = factory.buildCatChallenge({ skills: [s2] });
      const ch3 = factory.buildCatChallenge({ skills: [t1] });
      const ch4 = factory.buildCatChallenge({ skills: [t2] });
      const ch5 = factory.buildCatChallenge({ skills: [t3] });
      const answerCh1 = factory.buildCatAnswer({ challenge: ch2, result: 'ok' });
      const answerCh2 = factory.buildCatAnswer({ challenge: ch4, result: 'ko' });
      const assessment = factory.buildCatAssessment({
        course: factory.buildCatCourse({
          challenges: [ch1, ch2, ch3, ch4, ch5],
          competenceSkills: _.flatten([tube1, tube2]),
        }),
        answers: [answerCh1, answerCh2],
      });
      const expectedSkills = [s1, s2, t2, t3];

      // when
      const result = assessment.assessedSkills;

      // then
      expect(result).to.be.deep.equal(expectedSkills);
    });
  });

  describe('#filteredChallenges', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.filteredChallenges).to.exist;
    });

    it('should return challenges that have not been already answered', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const url3 = new CatSkill('url3');
      const ch1 = factory.buildCatChallenge({ skills: [web1] });
      const ch2 = factory.buildCatChallenge({ skills: [web2] });
      const ch3 = factory.buildCatChallenge({ skills: [url3] });
      const answerCh1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answerCh3 = new CatAnswer(ch3, AnswerStatus.OK);
      const challenges = [ch1, ch2, ch3];
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, [answerCh1, answerCh3]);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([ch2]);
    });

    it('should return an empty array when all challenges have been answered', function() {
      // given
      const web1 = new CatSkill('web1');
      const ch1 = factory.buildCatChallenge({ skills: [web1] });
      const answerCh1 = new CatAnswer(ch1, AnswerStatus.OK);
      const course = new CatCourse([ch1]);
      const assessment = new CatAssessment(course, [answerCh1]);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([]);
    });

    it('should not return any timed challenge if previous challenge was timed', function() {
      // given
      const [web1, web2, web3, web4] = factory.buildCatTube();
      const ch1 = factory.buildCatChallenge({ skills: [web1], timer: undefined });
      const ch2 = factory.buildCatChallenge({ skills: [web2], timer: 30 });
      const ch3 = factory.buildCatChallenge({ skills: [web3], timer: undefined });
      const ch4 = factory.buildCatChallenge({ skills: [web4], timer: 30 });
      const answerCh1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answerCh2 = new CatAnswer(ch2, AnswerStatus.OK);
      const challenges = [ch1, ch2, ch3, ch4];
      const course = new CatCourse(challenges);

      // when
      const assessment = new CatAssessment(course, [answerCh1, answerCh2]);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([ch3]);
    });

    it('should return only challenges that are validated, prevalidated, or validated without test', function() {
      // given
      const drop1 = factory.buildCatChallenge({ status: 'poubelle' });
      const keep1 = factory.buildCatChallenge({ status: 'validé' });
      const keep2 = factory.buildCatChallenge({ status: 'pré-validé' });
      const drop2 = factory.buildCatChallenge({ status: 'archive' });
      const drop3 = factory.buildCatChallenge({ status: 'proposé' });
      const keep3 = factory.buildCatChallenge({ status: 'validé sans test' });
      const course = new CatCourse([keep1, keep2, keep3, drop1, drop2, drop3]);

      // when
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([keep1, keep2, keep3]);
    });

    it('should not filer available challenges by priority skills (level <= 3) when there is no answers', function() {
      // given
      const lowLevelChallege = factory.buildCatChallenge({ skills: factory.buildCatTube({ min: 1, max: 1 }) });
      const midLevelChallege = factory.buildCatChallenge({ skills: factory.buildCatTube({ min: 3, max: 3 }) });
      const highLevelChallege = factory.buildCatChallenge({ skills: factory.buildCatTube({ min: 4, max: 4 }) });
      const highestLevelChallege = factory.buildCatChallenge({ skills: factory.buildCatTube({ min: 5, max: 5 }) });

      const course = factory.buildCatCourse({
        challenges: [
          midLevelChallege,
          lowLevelChallege,
          highLevelChallege,
          highestLevelChallege,
        ],
      });
      const assessment = new CatAssessment(course, []);

      // when
      const result = assessment.filteredChallenges;

      // then
      expect(result).to.have.same.members([
        lowLevelChallege,
        midLevelChallege,
        highLevelChallege,
        // XXX the highestLevelChallenge is filtered out because it is too hard
        // (over 2 level over first estimated level of 2)
        // highestLevelChallege,
      ]);
    });

    it('should not ask a question that targets a skill already assessed', function() {
      // given
      const [rechinfo1, rechinfo2, rechinfo3] = factory.buildCatTube();

      const ch1 = factory.buildCatChallenge({ skills: [rechinfo1] });
      const ch2 = factory.buildCatChallenge({ skills: [rechinfo2] });
      const ch3 = factory.buildCatChallenge({ skills: [rechinfo2] });
      const ch4 = factory.buildCatChallenge({ skills: [rechinfo3] });

      const answerCh1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answerCh2 = new CatAnswer(ch2, AnswerStatus.OK);
      const challenges = [ch1, ch2, ch3, ch4];
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, [answerCh1, answerCh2]);

      // when
      const result = assessment.filteredChallenges;

      // then
      expect(result).to.deep.equal([ch4]);
    });

  });

  describe('#_computeReward()', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment._computeReward).to.exist;
    });

    it('should have a reward of 2 if challenge requires web2 within web1-2-3 and no answer has been given yet', function() {
      // given
      const predictedLevel = 2;
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const ch1 = new CatChallenge('recXXX', 'validé', [web2]);
      const ch2 = new CatChallenge('recYYY', 'validé', [web1, web3]);
      const course = new CatCourse([ch1, ch2]);

      // when
      const assessment = new CatAssessment(course, []);

      // then
      const expectedReward = 2;
      expect(assessment._computeReward(ch1, predictedLevel)).to.equal(expectedReward);
    });

    it('should be 2.73 if challenge requires url3 within url2-3-4-5 and no answer has been given yet', function() {
      // given
      const predictedLevel = 2;
      const url2 = new CatSkill('url2');
      const url3 = new CatSkill('url3');
      const url4 = new CatSkill('url4');
      const url5 = new CatSkill('url5');
      const ch1 = new CatChallenge('recXXX', 'validé', [url3]);
      const ch2 = new CatChallenge('recYYY', 'validé', [url2, url4, url5]);
      const course = new CatCourse([ch1, ch2]);

      // when
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment._computeReward(ch1, predictedLevel)).to.equal(2.7310585786300052);
    });
  });

  describe('#_firstChallenge', function() {

    let _, url2, url3, url5, challenge1, challenge2, challenge3, challenge4, challenge5, course, assessment;

    beforeEach(() => {
      [url2, url3, _, url5] = factory.buildCatTube({ min: 2, max: 5 });
      challenge1 = new CatChallenge('b', 'validé', [url2], 30);
      challenge2 = new CatChallenge('c', 'validé', [url2], undefined);
      challenge3 = new CatChallenge('f', 'validé sans test', [url3], 60);
      challenge4 = new CatChallenge('g', 'validé sans test', [url5], undefined);
      challenge5 = new CatChallenge('h', 'validé sans test', [url2], undefined);
      course = new CatCourse([challenge1, challenge2, challenge3, challenge4, challenge5]);
      assessment = new CatAssessment(course, []);
    });

    it('should exist', function() {
      expect(assessment._firstChallenge).to.exist;
    });

    it('should return a challenge of level two for a first challenge', function() {
      // then
      expect(assessment._firstChallenge.hardestSkill.difficulty).to.equal(2);

    });

    it('should return a challenge which is not timed as a first challenge', function() {
      // then
      expect(assessment._firstChallenge.timer).to.equal(undefined);
    });
  });

  describe('#nextChallenge', function() {
    it('should exist', function() {
      // given
      const web2 = new CatSkill('web2');
      const challenge = new CatChallenge('recXXX', 'validé', [web2]);
      const course = new CatCourse([challenge]);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.nextChallenge).to.exist;
    });

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const challenge1 = new CatChallenge('recWeb1', 'validé', [web1]);
      const challenge2 = new CatChallenge('recWeb2', 'validé', [web2]);
      const challenge3 = new CatChallenge('recWeb3', 'validé', [web3]);

      const challenges = [challenge1, challenge2, challenge3];

      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.nextChallenge).to.equal(challenge2);
    });

    context('when the first question is correctly answered', () => {

      function _buildValidatedChallenge(skillName) {
        const skill = new CatSkill(skillName);

        return new CatChallenge(`recChallengeFor${skill}`, 'validé', [skill]);
      }

      it('should select in priority a challenge in the unexplored tubes with level below level 3', function() {
        // given
        const challengeUrl4 = _buildValidatedChallenge('url4');
        const challengeUrl5 = _buildValidatedChallenge('url5');
        const challengeWeb3 = _buildValidatedChallenge('web3');
        const challengeInfo2 = _buildValidatedChallenge('info2');

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];

        const answer1 = new CatAnswer(challengeInfo2, AnswerStatus.OK);

        const course = new CatCourse(challenges);
        const assessment = new CatAssessment(course, [answer1]);

        // then
        expect(assessment.nextChallenge).to.equal(challengeWeb3);
      });

      it('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const challengeUrl4 = _buildValidatedChallenge('url4');
        const challengeUrl6 = _buildValidatedChallenge('url6');
        const challengeInfo2 = _buildValidatedChallenge('info2');

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answer1 = new CatAnswer(challengeInfo2, AnswerStatus.OK);

        const course = new CatCourse(challenges);
        const assessment = new CatAssessment(course, [answer1]);

        // then
        expect(assessment.nextChallenge).to.equal(challengeUrl4);
      });

    });

    it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const url3 = new CatSkill('url3');
      const url4 = new CatSkill('url4');
      const rechInfo5 = new CatSkill('rechInfo5');
      const url6 = new CatSkill('url6');
      const rechInfo7 = new CatSkill('rechInfo7');
      const ch1 = new CatChallenge('recEasy', 'validé', [web1]);
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch3 = new CatChallenge('rec3', 'validé', [url3]);
      const ch4 = new CatChallenge('rec4', 'validé', [url4]);
      const ch5 = new CatChallenge('rec5', 'validé', [rechInfo5]);
      const ch6 = new CatChallenge('rec6', 'validé', [url6]);
      const ch7 = new CatChallenge('rec7', 'validé', [rechInfo7]);
      const course = new CatCourse([ch1, ch2, ch3, ch4, ch5, ch6, ch7]);
      const answer1 = new CatAnswer(ch2, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch4, AnswerStatus.OK);
      const answer3 = new CatAnswer(ch6, AnswerStatus.KO);
      const assessment = new CatAssessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.nextChallenge).to.equal(ch5);
    });

    it('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
      // given
      const web2 = new CatSkill('url2');
      const url3 = new CatSkill('url3');
      const rechInfo5 = new CatSkill('rechInfo5');
      const web7 = new CatSkill('web7');
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch3 = new CatChallenge('rec3', 'validé', [url3]);
      const ch5 = new CatChallenge('rec5', 'validé', [rechInfo5]);
      const ch7 = new CatChallenge('rec7', 'validé', [web7]);
      const course = new CatCourse([ch2, ch3, ch5, ch7]);
      const answer1 = new CatAnswer(ch2, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch3, AnswerStatus.OK);
      const answer3 = new CatAnswer(ch5, AnswerStatus.KO);

      // when
      const assessment = new CatAssessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    context('when one challenge (level3) has been archived', () => {
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const web4 = new CatSkill('web4');
      const web5 = new CatSkill('web5');
      const ch1 = new CatChallenge('recEasy', 'validé', [web1]);
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch3 = new CatChallenge('rec3', 'archive', [web3]);
      const ch3Bis = new CatChallenge('rec3bis', 'validé', [web3]);
      const ch4 = new CatChallenge('rec4', 'validé', [web4]);
      const ch5 = new CatChallenge('rec5', 'validé', [web5]);

      it('should return a challenge of level 3 if user got levels 1, 2 ,3 and 4 at KO', function() {
        // given
        const course = new CatCourse([ch1, ch2, ch3, ch3Bis, ch4, ch5]);
        const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
        const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
        const answer3 = new CatAnswer(undefined, AnswerStatus.OK);
        const answer4 = new CatAnswer(ch4, AnswerStatus.KO);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3, answer4]);

        // then
        expect(assessment.nextChallenge).to.equal(ch3Bis);
      });

      it('should return a challenge of level 5 if user got levels 1, 2, 3, 4 with OK', function() {
        // given
        const course = new CatCourse([ch1, ch2, ch3, ch3Bis, ch4, ch5]);
        const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
        const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
        const answer3 = new CatAnswer(undefined, AnswerStatus.OK);
        const answer4 = new CatAnswer(ch4, AnswerStatus.OK);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3, answer4]);

        // then
        expect(assessment.nextChallenge).to.equal(ch5);
      });
      it('should return a challenge of level 4 if user got levels 1, 2 and  3 archived', function() {
        // given
        const course = new CatCourse([ch1, ch2, ch3, ch3Bis, ch4]);
        const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
        const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
        const answer3 = new CatAnswer(undefined, AnswerStatus.OK);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3]);

        // then
        expect(assessment.nextChallenge).to.equal(ch4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and 3 archived', function() {
        // given
        const course = new CatCourse([ch1, ch2, ch3, ch3Bis]);
        const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
        const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
        const answer3 = new CatAnswer(undefined, AnswerStatus.OK);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3]);

        // then
        expect(assessment.nextChallenge).to.equal(ch3Bis);
      });
    });

    it('should return null if remaining challenges do not provide extra validated or failed skills', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const ch1 = new CatChallenge('rec1', 'validé', [web1]);
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch3 = new CatChallenge('rec3', 'validé', [web2]);
      const course = new CatCourse([ch1, ch2, ch3]);
      const answer = new CatAnswer(ch2, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    it('should return null if 20 challenges have been answered so far', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const challenges = [];
      const answers = [];
      for (let i = 0; i < 20; i++) {
        challenges.push(new CatChallenge('rec' + i, 'validé', [web1]));
        answers.push(new CatAnswer(challenges[i], AnswerStatus.OK));
      }
      challenges.push(new CatChallenge('rec20', 'validé', [web2]));
      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, answers);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    it('should call _firstChallenge function if the assessment has no answer', function() {
      // given
      const firstChallenge = factory.buildCatChallenge();
      const challenges = [];
      const course = new CatCourse(challenges);
      const answers = [];
      const assessment = new CatAssessment(course, answers);
      // XXX getters stubs does not spy so we do it manually in the getter stub
      const firstChallengeSpy = sinon.stub().returns(firstChallenge);
      const firstChallengeStub = sinon.stub(assessment, '_firstChallenge').get(firstChallengeSpy);

      // when
      const result = assessment.nextChallenge;

      // then
      expect(firstChallengeSpy).to.have.been.called;
      expect(result).to.be.equal(firstChallenge);
      firstChallengeStub.restore();
    });

    it('should return an easier challenge if user skipped previous challenge', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const ch1 = new CatChallenge('rec1', 'validé', [web1]);
      const ch2a = new CatChallenge('rec2a', 'validé', [web2]);
      const ch2b = new CatChallenge('rec2b', 'validé', [web2]);
      const ch3 = new CatChallenge('rec3', 'validé', [web3]);
      const course = new CatCourse([ch1, ch2a, ch2b, ch3]);
      const answer = new CatAnswer(ch2a, AnswerStatus.SKIPPED);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect(assessment.nextChallenge.hardestSkill.difficulty).to.be.equal(1);
    });

    it('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web3 = new CatSkill('web3');
      const url3 = new CatSkill('url3');
      const ch1 = new CatChallenge('rec1', 'validé', [web1]);
      const ch2a = new CatChallenge('rec2a', 'validé', [web2]);
      const ch3a = new CatChallenge('rec3a', 'validé', [web3]);
      const ch3b = new CatChallenge('rec3b', 'validé', [web3]);
      const ch3c = new CatChallenge('rec3c', 'validé', [url3]);
      const course = new CatCourse([ch1, ch2a, ch3a, ch3b, ch3c]);
      const answer = new CatAnswer(ch2a, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer]);

      // then
      expect(assessment.nextChallenge.hardestSkill.difficulty).to.be.equal(3);
    });

    it('should not return a question of level 6 after first answer is correct', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web4 = new CatSkill('web4');
      const web6 = new CatSkill('web6');
      const ch1 = new CatChallenge('rec1', 'validé', [web1]);
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch4 = new CatChallenge('rec4', 'validé', [web4]);
      const ch6 = new CatChallenge('rec6', 'validé', [web6]);
      const challenges = [ch1, ch2, ch4, ch6];
      const course = new CatCourse(challenges);
      const answer = new CatAnswer(ch2, AnswerStatus.OK);
      const answers = [answer];
      const assessment = new CatAssessment(course, answers);

      // then
      expect(assessment.nextChallenge.skills[0].difficulty).not.to.be.equal(6);
    });

    it('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
      // given
      const web1 = new CatSkill('web1');
      const web2 = new CatSkill('web2');
      const web4 = new CatSkill('web4');
      const web6 = new CatSkill('web6');
      const web7 = new CatSkill('web7');
      const ch1 = new CatChallenge('rec1', 'validé', [web1]);
      const ch2 = new CatChallenge('rec2', 'validé', [web2]);
      const ch4 = new CatChallenge('rec4', 'validé', [web4]);
      const ch6 = new CatChallenge('rec6', 'validé', [web6]);
      const ch7 = new CatChallenge('rec7', 'validé', [web7]);
      const challenges = [ch1, ch2, ch4, ch6, ch7];
      const course = new CatCourse(challenges);
      const answer2 = new CatAnswer(ch2, AnswerStatus.OK);
      const answer6 = new CatAnswer(ch6, AnswerStatus.OK);
      const answers = [answer2, answer6];
      const assessment = new CatAssessment(course, answers);

      // then
      expect(assessment.nextChallenge.skills).to.be.deep.equal([web7]);
    });

    it('should not select a challenge that is more than 2 levels above the predicted level', function() {
      // given
      const web2 = new CatSkill('web2');
      const url7 = new CatSkill('url7');
      const challengeWeb2 = new CatChallenge('rec2', 'validé', [web2]);
      const challengeUrl7 = new CatChallenge('rec7', 'validé', [url7]);
      const course = new CatCourse([challengeWeb2, challengeUrl7]);
      const answer1 = new CatAnswer(challengeWeb2, AnswerStatus.OK);

      // when
      const assessment = new CatAssessment(course, [answer1]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

  });

  describe('#pixScore', function() {
    it('should exist', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);

      // then
      expect(assessment.pixScore).to.exist;
    });

    it('should be 0 if no skill has been validated', function() {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new CatSkill(skillName));
      const ch1 = new CatChallenge('a', 'validé', [skills['web1'], skills['web2']]);
      const ch2 = new CatChallenge('b', 'validé', [skills['web3']]);
      const course = new CatCourse([ch1, ch2], competenceSkills);
      const answer1 = new CatAnswer(ch1, AnswerStatus.KO);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const assessment = new CatAssessment(course, [answer1, answer2]);

      // then
      expect(assessment.pixScore).to.be.equal(0);
    });

    it('should be 8 if validated skills are web1 among 2 (4 pix), web2 (4 pix) but not web3 among 4 (2 pix)', () => {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new CatSkill(skillName));
      const ch1 = new CatChallenge('a', 'validé', [skills['web1'], skills['web2']]);
      const ch2 = new CatChallenge('b', 'validé', [skills['web3']]);
      const course = new CatCourse([ch1, ch2], competenceSkills);
      const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const assessment = new CatAssessment(course, [answer1, answer2]);

      // then
      expect(assessment.pixScore).to.be.equal(8);
    });

    it('should be 6 if validated skills are web1 (4 pix) and fou3 among 4 (2 pix) (web2 was failed)', () => {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = {};
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new CatSkill(skillName));
      const ch1 = new CatChallenge('a', 'validé', [skills['web1']]);
      const ch2 = new CatChallenge('b', 'validé', [skills['web2']]);
      const ch3 = new CatChallenge('c', 'validé', [skills['fou3']]);
      const course = new CatCourse([ch1, ch2, ch3], competenceSkills);
      const answer1 = new CatAnswer(ch1, AnswerStatus.OK);
      const answer2 = new CatAnswer(ch2, AnswerStatus.KO);
      const answer3 = new CatAnswer(ch3, AnswerStatus.OK);
      const assessment = new CatAssessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.pixScore).to.be.equal(6);
    });

    context('when one challenge was archived', () => {
      it('should return maximum score even if one answer has undefined challenge and skill do not exist anymore', () => {

        // given
        const skillNames = ['web1', 'web3', 'ch1', 'ch2', 'ch3', 'truc2'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new CatSkill(skillName));
        const web1Challenge = new CatChallenge('a', 'validé', [skills['web1']]);
        const web3Challege = new CatChallenge('c', 'validé', [skills['web3']]);
        const ch1Challenge = new CatChallenge('a', 'validé', [skills['ch1']]);
        const ch2Challenge = new CatChallenge('b', 'archived', [skills['ch2']]);
        const ch3Challege = new CatChallenge('c', 'validé', [skills['ch3']]);
        const truc2Challege = new CatChallenge('c', 'validé', [skills['truc2']]);
        const course = new CatCourse([web1Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege, truc2Challege], competenceSkills);
        const answer1 = new CatAnswer(web1Challenge, AnswerStatus.OK);
        const answer2 = new CatAnswer(undefined, AnswerStatus.OK);
        const answer3 = new CatAnswer(web3Challege, AnswerStatus.OK);
        const answer4 = new CatAnswer(ch1Challenge, AnswerStatus.OK);
        const answer5 = new CatAnswer(ch2Challenge, AnswerStatus.OK);
        const answer6 = new CatAnswer(ch3Challege, AnswerStatus.OK);
        const answer7 = new CatAnswer(truc2Challege, AnswerStatus.OK);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3, answer4, answer5, answer6, answer7]);

        // then
        expect(assessment.pixScore).to.be.equal(24);
      });

      it('should return maximum score even if one answer has undefined challenge and but skill exist', () => {

        // given
        const skillNames = ['web1', 'web2', 'web3', 'ch1', 'ch2', 'ch3'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new CatSkill(skillName));
        const web1Challenge = new CatChallenge('a', 'validé', [skills['web1']]);
        const web2Challenge = new CatChallenge('a', 'validé', [skills['web2']]);
        const web3Challege = new CatChallenge('c', 'validé', [skills['web3']]);
        const ch1Challenge = new CatChallenge('a', 'validé', [skills['ch1']]);
        const ch2Challenge = new CatChallenge('b', 'archived', [skills['ch2']]);
        const ch3Challege = new CatChallenge('c', 'validé', [skills['ch3']]);
        const course = new CatCourse([web1Challenge, web2Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege], competenceSkills);
        const answer1 = new CatAnswer(web1Challenge, AnswerStatus.OK);
        const answer2 = new CatAnswer(undefined, AnswerStatus.OK);
        const answer3 = new CatAnswer(web3Challege, AnswerStatus.OK);
        const answer4 = new CatAnswer(ch1Challenge, AnswerStatus.OK);
        const answer5 = new CatAnswer(ch2Challenge, AnswerStatus.OK);
        const answer6 = new CatAnswer(ch3Challege, AnswerStatus.OK);
        const assessment = new CatAssessment(course, [answer1, answer2, answer3, answer4, answer5, answer6]);

        // then
        expect(assessment.pixScore).to.be.equal(24);
      });
    });
  });

  describe('#displayedPixScore', function() {

    it('should be 7 if pixScore is 7.98', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 7.98);

      // then
      expect(assessment.displayedPixScore).to.equal(7);
    });

    it('should be 8 if pixScore is 8.02', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 8.02);

      // then
      expect(assessment.displayedPixScore).to.equal(8);
    });
  });

  describe('#obtainedLevel', function() {

    it('should be 0 if pixScore is 7.98', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 7.98);

      // then
      expect(assessment.obtainedLevel).to.equal(0);
    });

    it('should be 1 if pixScore is 8.02', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 8.02);

      // then
      expect(assessment.obtainedLevel).to.equal(1);
    });

    it('should be 5 even if pixScore is 48 (level 6 must not be reachable for the moment)', function() {
      // given
      const course = new CatCourse([], []);
      const assessment = new CatAssessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 48);

      // then
      expect(assessment.obtainedLevel).to.equal(5);
    });

  });

  context('#_skillsToTargetInPriority', () => {

    function _buildValidatedChallenge(skillName) {
      const skill = new CatSkill(skillName);

      return new CatChallenge(`recChallengeFor${skill}`, 'validé', [skill]);
    }

    it('should select in priority a challenge in the unexplored tubes with level below level 3', function() {
      // given
      const challengeUrl4 = _buildValidatedChallenge('url4');
      const challengeUrl5 = _buildValidatedChallenge('url5');
      const challengeWeb3 = _buildValidatedChallenge('web3');
      const challengeInfo2 = _buildValidatedChallenge('info2');

      const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];

      const answer1 = new CatAnswer(challengeInfo2, AnswerStatus.OK);

      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, [answer1]);

      // when
      const skillsToTarget = assessment._skillsToTargetInPriority();

      // then
      expect(skillsToTarget).to.deep.equal(challengeWeb3.skills);
    });

    it('should make sure that every skill in easy tubes are evaluated', function() {
      // given
      const challengeUrl4 = _buildValidatedChallenge('url4');
      const challengeUrl5 = _buildValidatedChallenge('url5');
      const challengeWeb3 = _buildValidatedChallenge('web3');
      const challengeInfo1 = _buildValidatedChallenge('info1');
      const challengeInfo2 = _buildValidatedChallenge('info2');
      const challengeInfo3 = _buildValidatedChallenge('info3');

      const challenges = [challengeUrl4, challengeUrl5, challengeInfo1, challengeInfo2, challengeInfo3, challengeWeb3];

      const answer1 = new CatAnswer(challengeInfo2, AnswerStatus.OK);
      const answer2 = new CatAnswer(challengeWeb3, AnswerStatus.OK);

      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, [answer1, answer2]);

      // when
      const skillsToTarget = assessment._skillsToTargetInPriority();

      // then
      const expectedListOfSkills = [].concat(challengeInfo3.skills, challengeInfo2.skills, challengeInfo1.skills);
      expect(skillsToTarget).to.deep.equal(expectedListOfSkills);
    });

    it('should nevertheless target any tubes when there is no easy tube', function() {
      // given
      const challengeUrl4 = _buildValidatedChallenge('url4');
      const challengeUrl5 = _buildValidatedChallenge('url5');
      const challengeInfo2 = _buildValidatedChallenge('info2');

      const challenges = [challengeUrl4, challengeUrl5, challengeInfo2];

      const answer1 = new CatAnswer(challengeInfo2, AnswerStatus.OK);

      const course = new CatCourse(challenges);
      const assessment = new CatAssessment(course, [answer1]);

      // when
      const skillsToTarget = assessment._skillsToTargetInPriority();

      // then
      expect(skillsToTarget).to.deep.equal([]);
    });

  });

});
