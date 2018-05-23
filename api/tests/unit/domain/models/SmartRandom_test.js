const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartRandom = require('../../../../lib/domain/models/SmartRandom');

describe('Unit | Domain | Models | SmartRandom', () => {

  function _newChallenge(id, skills, status = 'validé') {
    return new Challenge({ id, skills, status });
  }
  function _newSkill(name) {
    return new Skill({ name: '@'+name });
  }
  function _newAnswer(challengeId, result) {
    return new Answer({ challengeId, result });
  }

  describe('#constructor', () => {
    it('should create a course with tubes', () => {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const challenge1 = _newChallenge('recWeb1', [web1]);
      const challenge2 = _newChallenge('recWeb2', [web2]);
      const challenge3 = _newChallenge('recWeb3', [web3]);

      const challenges = [challenge1, challenge2, challenge3];
      const skills = [web1, web2, web3];
      const expectedTubes = {
        'web': [web1, web2, web3]
      };
      // when
      const smartRandom = new SmartRandom([], challenges, skills);

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal(expectedTubes);
    });

    it('should create a course with tubes contains only skills with challenges', () => {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const challenge1 = _newChallenge('recWeb1', [web1]);
      const challenge2 = _newChallenge('recWeb2', [web2]);

      const challenges = [challenge1, challenge2];
      const skills = [web1, web2, web3];
      const expectedTubes = {
        'web': [web1, web2]
      };
      // when
      const smartRandom = new SmartRandom([], challenges, skills);

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal(expectedTubes);
    });
  });

  describe('#nextChallenge', function() {

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const challenge1 = _newChallenge('recWeb1', [web1]);
      const challenge2 = _newChallenge('recWeb2', [web2]);
      const challenge3 = _newChallenge('recWeb3', [web3]);

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
        const url4 = _newSkill('url4');
        const url5 = _newSkill('url5');
        const web3 = _newSkill('web3');
        const info2 = _newSkill('info2');
        const skills = [url4, url5, web3, info2];

        const challengeUrl4 = _newChallenge('recUrl4', [url4]);
        const challengeUrl5 = _newChallenge('recUrl5', [url5]);
        const challengeWeb3 = _newChallenge('recWeb3', [web3]);
        const challengeInfo2 = _newChallenge('recInfo2', [info2]);

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];

        const answer1 = _newAnswer('recInfo2', AnswerStatus.OK);
        const answers = [answer1];

        // when
        const smartRandom = new SmartRandom(answers, challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb3);
      });

      it('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const url4 = _newSkill('url4');
        const url6 = _newSkill('url6');
        const info2 = _newSkill('info2');
        const skills = [url4, url6, info2];

        const challengeUrl4 = _newChallenge('recUrl4', [url4]);
        const challengeUrl6 = _newChallenge('recUrl6', [url6]);
        const challengeInfo2 = _newChallenge('recInfo2', [info2]);

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answer1 = _newAnswer('recInfo2',AnswerStatus.OK);

        // when
        const smartRandom = new SmartRandom([answer1], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeUrl4);
      });

    });

    it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const url3 = _newSkill('url3');
      const url4 = _newSkill('url4');
      const rechInfo5 = _newSkill('rechInfo5');
      const url6 = _newSkill('url6');
      const rechInfo7 = _newSkill('rechInfo7');
      const skills = [web1, web2, url3, url4, rechInfo5, rechInfo7, url6];

      const ch1 = _newChallenge('recEasy', [web1]);
      const ch2 = _newChallenge('rec2', [web2]);
      const ch3 = _newChallenge('rec3', [url3]);
      const ch4 = _newChallenge('rec4', [url4]);
      const ch5 = _newChallenge('rec5', [rechInfo5]);
      const ch6 = _newChallenge('rec6', [url6]);
      const ch7 = _newChallenge('rec7', [rechInfo7]);
      const challenges = [ch1, ch2, ch3, ch4, ch5, ch6, ch7];

      const answer1 = _newAnswer('rec2', AnswerStatus.OK);
      const answer2 = _newAnswer('rec4', AnswerStatus.OK);
      const answer3 = _newAnswer('rec6', AnswerStatus.KO);

      // when
      const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(ch5);
    });

    it('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
      // given
      const web2 = _newSkill('url2');
      const url3 = _newSkill('url3');
      const rechInfo5 = _newSkill('rechInfo5');
      const web7 = _newSkill('web7');
      const skills = [web2, url3, rechInfo5, web7];

      const ch2 = _newChallenge('rec2', [web2]);
      const ch3 = _newChallenge('rec3', [url3]);
      const ch5 = _newChallenge('rec5', [rechInfo5]);
      const ch7 = _newChallenge('rec7', [web7]);
      const challenges = [ch2, ch3, ch5, ch7];

      const answer1 = _newAnswer('rec2', AnswerStatus.OK);
      const answer2 = _newAnswer('rec3', AnswerStatus.OK);
      const answer3 = _newAnswer('rec5', AnswerStatus.KO);

      // when
      const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);

    });

    context('when one challenge (level3) has been archived', () => {
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const web4 = _newSkill('web4');
      const web5 = _newSkill('web5');
      const skills = [web1, web2, web3, web4, web5];

      const ch1 = _newChallenge('rec1', [web1]);
      const ch2 = _newChallenge('rec2', [web2]);
      const ch3 = _newChallenge('rec3', [web3]);
      const ch3Bis = _newChallenge('rec3bis', [web3]);
      const ch4 = _newChallenge('rec4', [web4]);
      const ch5 = _newChallenge('rec5', [web5]);
      let challenges = [ch1, ch2, ch3, ch3Bis, ch4, ch5];

      it('should return a challenge of level 3 if user got levels 1, 2 ,3 and 4 at KO', function() {
        // given
        const answer1 = _newAnswer('rec1', AnswerStatus.OK);
        const answer2 = _newAnswer('rec2', AnswerStatus.OK);
        const answer3 = _newAnswer(undefined, AnswerStatus.OK);
        const answer4 = _newAnswer('rec4', AnswerStatus.KO);
        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3, answer4], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.skills[0].name).to.equal('@web3');
      });

      it('should return a challenge of level 5 if user got levels 1, 2, 3, 4 with OK', function() {
        // given
        const answer1 = _newAnswer('rec1', AnswerStatus.OK);
        const answer2 = _newAnswer('rec2', AnswerStatus.OK);
        const answer3 = _newAnswer(undefined, AnswerStatus.OK);
        const answer4 = _newAnswer('rec4', AnswerStatus.OK);

        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3, answer4], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch5);
      });

      it('should return a challenge of level 4 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answer1 = _newAnswer('rec1', AnswerStatus.OK);
        const answer2 = _newAnswer('rec2', AnswerStatus.OK);
        const answer3 = _newAnswer(undefined, AnswerStatus.OK);
        challenges = [ch1, ch2, ch3, ch3Bis, ch4];

        // when
        const smartRandom = new SmartRandom([answer1, answer2, answer3], challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answer1 = _newAnswer('rec1', AnswerStatus.OK);
        const answer2 = _newAnswer('rec2', AnswerStatus.OK);
        const answer3 = _newAnswer(undefined, AnswerStatus.OK);
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
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const skills = [web1, web2];
      const ch1 = _newChallenge('rec1', [web1]);
      const ch2 = _newChallenge('rec2', [web2]);
      const ch3 = _newChallenge('rec3', [web2]);
      const challenges = [ch1, ch2, ch3];
      const answer = _newAnswer('rec2', AnswerStatus.OK);

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.be.equal(null);
    });

    it('should return null if 20 challenges have been answered so far', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const skills = [web1, web2];
      const challenges = [];
      const answers = [];
      for (let i = 0; i < 20; i++) {
        const challengeId = 'rec'+i;
        challenges.push(_newChallenge(challengeId, [web1]));
        answers.push(_newAnswer(challengeId, AnswerStatus.OK));
      }
      challenges.push(_newChallenge('rec21', [web1]));

      // when
      const smartRandom = new SmartRandom(answers, challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.be.equal(null);
    });

    it('should call _firstChallenge function if the assessment has no answer', function() {
      // given
      const url2 = _newSkill('@url2');
      const firstChallenge = _newChallenge('rec', [url2]);
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
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const skills = [web1, web2, web3];
      const ch1 = _newChallenge('rec1', [web1]);
      const ch2a = _newChallenge('rec2a', [web2]);
      const ch2b = _newChallenge('rec2b', [web2]);
      const ch3 = _newChallenge('rec3', [web3]);
      const challenges = [ch1, ch2a, ch2b, ch3];
      const answer = _newAnswer('rec2a', AnswerStatus.SKIPPED);

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(1);
    });

    it('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web3 = _newSkill('web3');
      const url3 = _newSkill('url3');
      const skills = [web1, web2, web3, url3];
      const ch1 = _newChallenge('rec1', [web1]);
      const ch2a = _newChallenge('rec2a', [web2]);
      const ch3a = _newChallenge('rec3a', [web3]);
      const ch3b = _newChallenge('rec3b', [web3]);
      const ch3c = _newChallenge('rec3c', [url3]);
      const challenges = [ch1, ch2a, ch3a, ch3b, ch3c];
      const answer = _newAnswer('rec2a', AnswerStatus.OK);

      // when
      const smartRandom = new SmartRandom([answer], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(3);
    });

    it('should not return a question of level 6 after first answer is correct', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web4 = _newSkill('web4');
      const web6 = _newSkill('web6');
      const skills = [web1, web2, web4, web6];
      const ch1 = _newChallenge('rec1', [web1]);
      const ch2 = _newChallenge('rec2', [web2]);
      const ch4 = _newChallenge('rec4', [web4]);
      const ch6 = _newChallenge('rec6', [web6]);
      const challenges = [ch1, ch2, ch4, ch6];
      const answer = _newAnswer('rec2', AnswerStatus.OK);
      const answers = [answer];
      // when
      const smartRandom = new SmartRandom(answers, challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills[0].difficulty).not.to.be.equal(6);
    });

    it('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
      // given
      const web1 = _newSkill('web1');
      const web2 = _newSkill('web2');
      const web4 = _newSkill('web4');
      const web6 = _newSkill('web6');
      const web7 = _newSkill('web7');
      const skills = [web1, web2, web4, web6, web7];
      const ch1 = _newChallenge('rec1', [web1]);
      const ch2 = _newChallenge('rec2', [web2]);
      const ch4 = _newChallenge('rec4', [web4]);
      const ch6 = _newChallenge('rec6', [web6]);
      const ch7 = _newChallenge('rec7', [web7]);
      const challenges = [ch1, ch2, ch4, ch6, ch7];
      const answer2 = _newAnswer('rec2', AnswerStatus.OK);
      const answer6 = _newAnswer('rec6', AnswerStatus.OK);
      const answers = [answer2, answer6];

      // when
      const smartRandom = new SmartRandom(answers, challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills).to.be.deep.equal([web7]);

    });

    it('should not select a challenge that is more than 2 levels above the predicted level', function() {
      // given
      const web2 = _newSkill('web2');
      const url7 = _newSkill('url7');
      const skills = [web2, url7];
      const challengeWeb2 = _newChallenge('rec2', [web2]);
      const challengeUrl7 = _newChallenge('rec7', [url7]);
      const challenges = [challengeWeb2, challengeUrl7];
      const answer1 = _newAnswer('rec2', AnswerStatus.OK);

      // when
      const smartRandom = new SmartRandom([answer1], challenges, skills);
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);

    });

  });
});
