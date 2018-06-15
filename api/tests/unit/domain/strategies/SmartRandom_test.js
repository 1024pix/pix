const { expect, factory } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Tube = require('../../../../lib/domain/models/Tube');
const SmartRandom = require('../../../../lib/domain/strategies/SmartRandom');

describe('Unit | Domain | Models | SmartRandom', () => {

  describe('#constructor', () => {
    it('should create a course with tubes', () => {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web3 = factory.buildSkill({ name: 'web3' });
      const challenge1 = factory.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = factory.buildChallenge({ id: 'recWeb2', skills: [web2] });
      const challenge3 = factory.buildChallenge({ id: 'recWeb3', skills: [web3] });

      const challenges = [challenge1, challenge2, challenge3];
      const skills = [web1, web2, web3];
      const expectedTubes = new Tube({ skills: [web1, web2, web3] });
      // when
      const smartRandom = new SmartRandom([], challenges, skills);

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal([expectedTubes]);
    });

    it('should create a course with tubes contains only skills with challenges', () => {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web3 = factory.buildSkill({ name: 'web3' });
      const challenge1 = factory.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = factory.buildChallenge({ id: 'recWeb2', skills: [web2] });

      const challenges = [challenge1, challenge2];
      const skills = [web1, web2, web3];
      const expectedTubes = new Tube({ skills: [web1, web2] });

      // when
      const smartRandom = new SmartRandom([], challenges, skills);

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal([expectedTubes]);
    });
  });

  describe('#nextChallenge', function() {

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web3 = factory.buildSkill({ name: 'web3' });
      const challenge1 = factory.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = factory.buildChallenge({ id: 'recWeb2', skills: [web2] });
      const challenge3 = factory.buildChallenge({ id: 'recWeb3', skills: [web3] });

      const challenges = [challenge1, challenge2, challenge3];
      const skills = [web1, web2, web3];

      // when
      const smartRandom = new SmartRandom([], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(challenge2);
    });

    context('when the first question is correctly answered', () => {

      it('should select in priority a challenge in the unexplored tubes with level below level 3', function() {
        // given
        const url4 = factory.buildSkill({ name: 'url4' });
        const url5 = factory.buildSkill({ name: 'url5' });
        const web3 = factory.buildSkill({ name: 'web3' });
        const info2 = factory.buildSkill({ name: 'info2' });
        const skills = [url4, url5, web3, info2];

        const challengeUrl4 = factory.buildChallenge({ id: 'recUrl4', skills: [url4] });
        const challengeUrl5 = factory.buildChallenge({ id: 'recUrl5', skills: [url5] });
        const challengeWeb3 = factory.buildChallenge({ id: 'recWeb3', skills: [web3] });
        const challengeInfo2 = factory.buildChallenge({ id: 'recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];

        const answer1 = factory.buildAnswer({ challengeId: 'recInfo2', result: AnswerStatus.OK });
        const answers = [answer1];

        // when
        const smartRandom = new SmartRandom(answers, challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb3);
      });

      it('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const url4 = factory.buildSkill({ name: 'url4' });
        const url6 = factory.buildSkill({ name: 'url6' });
        const info2 = factory.buildSkill({ name: 'info2' });
        const skills = [url4, url6, info2];

        const challengeUrl4 = factory.buildChallenge({ id: 'recUrl4', skills: [url4] });
        const challengeUrl6 = factory.buildChallenge({ id: 'recUrl6', skills: [url6] });
        const challengeInfo2 = factory.buildChallenge({ id: 'recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answer1 = factory.buildAnswer({ challengeId: 'recInfo2', result: AnswerStatus.OK });

        // when
        const smartRandom = new SmartRandom([answer1], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeUrl4);
      });

    });

    it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const url3 = factory.buildSkill({ name: 'url3' });
      const url4 = factory.buildSkill({ name: 'url4' });
      const rechInfo5 = factory.buildSkill({ name: 'rechInfo5' });
      const url6 = factory.buildSkill({ name: 'url6' });
      const rechInfo7 = factory.buildSkill({ name: 'rechInfo7' });
      const skills = [web1, web2, url3, url4, rechInfo5, rechInfo7, url6];

      const ch1 = factory.buildChallenge({ id: 'recEasy', skills: [web1] });
      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch3 = factory.buildChallenge({ id: 'rec3', skills: [url3] });
      const ch4 = factory.buildChallenge({ id: 'rec4', skills: [url4] });
      const ch5 = factory.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
      const ch6 = factory.buildChallenge({ id: 'rec6', skills: [url6] });
      const ch7 = factory.buildChallenge({ id: 'rec7', skills: [rechInfo7] });
      const challenges = [ch1, ch2, ch3, ch4, ch5, ch6, ch7];

      const answer1 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
      const answer2 = factory.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.OK });
      const answer3 = factory.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.KO });

      // when
      const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(ch5);
    });

    it('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
      // given
      const web2 = factory.buildSkill({ name: 'url2' });
      const url3 = factory.buildSkill({ name: 'url3' });
      const rechInfo5 = factory.buildSkill({ name: 'rechInfo5' });
      const web7 = factory.buildSkill({ name: 'web7' });
      const skills = [web2, url3, rechInfo5, web7];

      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch3 = factory.buildChallenge({ id: 'rec3', skills: [url3] });
      const ch5 = factory.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
      const ch7 = factory.buildChallenge({ id: 'rec7', skills: [web7] });
      const challenges = [ch2, ch3, ch5, ch7];

      const answer1 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
      const answer2 = factory.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK });
      const answer3 = factory.buildAnswer({ challengeId: 'rec5', result: AnswerStatus.KO });

      // when
      const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);

    });

    context('when one challenge (level3) has been archived', () => {
      const web1 = factory.buildSkill({ name: '@web1' });
      const web2 = factory.buildSkill({ name: '@web2' });
      const web3 = factory.buildSkill({ name: '@web3' });
      const web4 = factory.buildSkill({ name: '@web4' });
      const web5 = factory.buildSkill({ name: '@web5' });
      const skills = [web1, web2, web3, web4, web5];

      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch3 = factory.buildChallenge({ id: 'rec3', skills: [web3] });
      const ch3Bis = factory.buildChallenge({ id: 'rec3bis', skills: [web3] });
      const ch4 = factory.buildChallenge({ id: 'rec4', skills: [web4] });
      const ch5 = factory.buildChallenge({ id: 'rec5', skills: [web5] });
      let challenges = [ch1, ch2, ch3, ch3Bis, ch4, ch5];

      it('should return a challenge of level 3 if user got levels 1, 2 ,3 and 4 at KO', function() {
        // given
        const answer1 = factory.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK });
        const answer2 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
        const answer3 = factory.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK });
        const answer4 = factory.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.KO });
        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3, answer4], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.skills[0].name).to.equal('@web3');
      });

      it('should return a challenge of level 5 if user got levels 1, 2, 3, 4 with OK', function() {
        // given
        const answer1 = factory.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK });
        const answer2 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
        const answer3 = factory.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK });
        const answer4 = factory.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.OK });

        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3, answer4], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch5);
      });

      it('should return a challenge of level 4 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answer1 = factory.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK });
        const answer2 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
        const answer3 = factory.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK });
        challenges = [ch1, ch2, ch3, ch3Bis, ch4];

        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answer1 = factory.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK });
        const answer2 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
        const answer3 = factory.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK });
        ch3.status = 'archived';
        challenges = [ch1, ch2, ch3, ch3Bis];

        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // ass
        expect(nextChallenge).to.equal(ch3Bis);
      });
    });

    it('should return null if remaining challenges do not provide extra validated or failed skills', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const skills = [web1, web2];
      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch3 = factory.buildChallenge({ id: 'rec3', skills: [web2] });
      const challenges = [ch1, ch2, ch3];
      const answer = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.be.equal(null);
    });

    it('should call _firstChallenge function if the assessment has no answer', function() {
      // given
      const url2 = factory.buildSkill({ name: '@url2' });
      const firstChallenge = factory.buildChallenge({ id: 'rec', skills: [url2] });
      const challenges = [firstChallenge];
      const answers = [];
      // when
      const smartRandom = new SmartRandom(answers, challenges, [url2]);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.be.equal(firstChallenge);
    });

    it('should return an easier challenge if user skipped previous challenge', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web3 = factory.buildSkill({ name: 'web3' });
      const skills = [web1, web2, web3];
      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2a = factory.buildChallenge({ id: 'rec2a', skills: [web2] });
      const ch2b = factory.buildChallenge({ id: 'rec2b', skills: [web2] });
      const ch3 = factory.buildChallenge({ id: 'rec3', skills: [web3] });
      const challenges = [ch1, ch2a, ch2b, ch3];
      const answer = factory.buildAnswer({ challengeId: 'rec2a', result: AnswerStatus.SKIPPED });

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(1);
    });

    it('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web3 = factory.buildSkill({ name: 'web3' });
      const url3 = factory.buildSkill({ name: 'url3' });
      const skills = [web1, web2, web3, url3];
      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2a = factory.buildChallenge({ id: 'rec2a', skills: [web2] });
      const ch3a = factory.buildChallenge({ id: 'rec3a', skills: [web3] });
      const ch3b = factory.buildChallenge({ id: 'rec3b', skills: [web3] });
      const ch3c = factory.buildChallenge({ id: 'rec3c', skills: [url3] });
      const challenges = [ch1, ch2a, ch3a, ch3b, ch3c];
      const answer = factory.buildAnswer({ challengeId: 'rec2a', result: AnswerStatus.OK });

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(3);
    });

    it('should not return a question of level 6 after first answer is correct', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web4 = factory.buildSkill({ name: 'web4' });
      const web6 = factory.buildSkill({ name: 'web6' });
      const skills = [web1, web2, web4, web6];
      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch4 = factory.buildChallenge({ id: 'rec4', skills: [web4] });
      const ch6 = factory.buildChallenge({ id: 'rec6', skills: [web6] });
      const challenges = [ch1, ch2, ch4, ch6];
      const answer = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
      const answers = [answer];
      // when
      const smartRandom = new SmartRandom(answers, challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills[0].difficulty).not.to.be.equal(6);
    });

    it('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
      // given
      const web1 = factory.buildSkill({ name: 'web1' });
      const web2 = factory.buildSkill({ name: 'web2' });
      const web4 = factory.buildSkill({ name: 'web4' });
      const web6 = factory.buildSkill({ name: 'web6' });
      const web7 = factory.buildSkill({ name: 'web7' });
      const skills = [web1, web2, web4, web6, web7];
      const ch1 = factory.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch4 = factory.buildChallenge({ id: 'rec4', skills: [web4] });
      const ch6 = factory.buildChallenge({ id: 'rec6', skills: [web6] });
      const ch7 = factory.buildChallenge({ id: 'rec7', skills: [web7] });
      const challenges = [ch1, ch2, ch4, ch6, ch7];
      const answer2 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });
      const answer6 = factory.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.OK });
      const answers = [answer2, answer6];

      // when
      const smartRandom = new SmartRandom(answers, challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills).to.be.deep.equal([web7]);

    });

    it('should not select a challenge that is more than 2 levels above the predicted level', function() {
      // given
      const web2 = factory.buildSkill({ name: 'web2' });
      const url7 = factory.buildSkill({ name: 'url7' });
      const skills = [web2, url7];
      const challengeWeb2 = factory.buildChallenge({ id: 'rec2', skills: [web2] });
      const challengeUrl7 = factory.buildChallenge({ id: 'rec7', skills: [url7] });
      const challenges = [challengeWeb2, challengeUrl7];
      const answer1 = factory.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK });

      // when
      const smartRandom = new SmartRandom([answer1], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);
    });
  });

  describe('SmartRandom._filteredChallenges()', function() {
    it('should not ask a question that targets a skill already assessed', function() {
      // given
      const [s1, s2, s3] = factory.buildSkillCollection();

      const ch1 = factory.buildChallenge({ skills: [s1] });
      const ch2 = factory.buildChallenge({ skills: [s2] });
      const ch3 = factory.buildChallenge({ skills: [s2] });
      const ch4 = factory.buildChallenge({ skills: [s3] });

      const answerCh1 = factory.buildAnswer({ challengeId: ch1.id, result: AnswerStatus.OK });
      const answerCh2 = factory.buildAnswer({ challengeId: ch2.id, result: AnswerStatus.OK });
      const challenges = [ch1, ch2, ch3, ch4];

      // when
      const smartRandom = new SmartRandom([answerCh1, answerCh2], challenges, [s1, s2, s3]);
      const result = SmartRandom._filteredChallenges(
        smartRandom.challenges,
        smartRandom.answers,
        smartRandom.tubes,
        smartRandom.validatedSkills,
        smartRandom.failedSkills,
        smartRandom.getPredictedLevel(),
      );

      // then
      expect(result).to.deep.equal([ch4]);
    });
  });
});
