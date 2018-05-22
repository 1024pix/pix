const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const Course = require('../../../../lib/domain/models/Course');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartRandom = require('../../../../lib/domain/models/SmartRandom');

describe('Unit | Domain | Models | SmartRandom', () => {

  describe('#nextChallenge', function() {

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = new Skill({ name: 'web1' });
      const web2 = new Skill({ name: 'web2' });
      const web3 = new Skill({ name: 'web3' });
      const challenge1 = new Challenge({ id: 'recWeb1', skills: [web1], status: 'validé' });
      const challenge2 = new Challenge({ id: 'recWeb2', skills: [web2], status: 'validé' });
      const challenge3 = new Challenge({ id: 'recWeb3', skills: [web3], status: 'validé' });

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
        const url4 = new Skill({ name: 'url4' });
        const url5 = new Skill({ name: 'url5' });
        const web3 = new Skill({ name: 'web3' });
        const info2 = new Skill({ name: 'info2' });
        const skills = [url4, url5, web3, info2];

        const challengeUrl4 = new Challenge({ id: 'recUrl4', skills: [url4], status: 'validé' });
        const challengeUrl5 = new Challenge({ id: 'recUrl5', skills: [url5], status: 'validé' });
        const challengeWeb3 = new Challenge({ id: 'recWeb3', skills: [web3], status: 'validé' });
        const challengeInfo2 = new Challenge({ id: 'recInfo2', skills: [info2], status: 'validé' });

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];

        const answer1 = new Answer({ challengeId: 'recInfo2', result: AnswerStatus.OK });
        const answers = [answer1];

        // when
        const smartRandom = new SmartRandom(answers, challenges, skills);
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb3);
      });

      it.skip('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const challengeUrl4 = _buildValidatedChallenge('url4');
        const challengeUrl6 = _buildValidatedChallenge('url6');
        const challengeInfo2 = _buildValidatedChallenge('info2');

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answer1 = new Answer(challengeInfo2, AnswerStatus.OK);

        const course = new Course(challenges);
        const assessment = new Assessment(course, [answer1]);

        // then
        expect(assessment.nextChallenge).to.equal(challengeUrl4);
      });

    });

    it.skip('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const url3 = new Skill('url3');
      const url4 = new Skill('url4');
      const rechInfo5 = new Skill('rechInfo5');
      const url6 = new Skill('url6');
      const rechInfo7 = new Skill('rechInfo7');
      const ch1 = new Challenge('recEasy', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch3 = new Challenge('rec3', 'validé', [url3]);
      const ch4 = new Challenge('rec4', 'validé', [url4]);
      const ch5 = new Challenge('rec5', 'validé', [rechInfo5]);
      const ch6 = new Challenge('rec6', 'validé', [url6]);
      const ch7 = new Challenge('rec7', 'validé', [rechInfo7]);
      const course = new Course([ch1, ch2, ch3, ch4, ch5, ch6, ch7]);
      const answer1 = new Answer(ch2, AnswerStatus.OK);
      const answer2 = new Answer(ch4, AnswerStatus.OK);
      const answer3 = new Answer(ch6, AnswerStatus.KO);
      const assessment = new Assessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.nextChallenge).to.equal(ch5);
    });

    it.skip('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
      // given
      const web2 = new Skill('url2');
      const url3 = new Skill('url3');
      const rechInfo5 = new Skill('rechInfo5');
      const web7 = new Skill('web7');
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch3 = new Challenge('rec3', 'validé', [url3]);
      const ch5 = new Challenge('rec5', 'validé', [rechInfo5]);
      const ch7 = new Challenge('rec7', 'validé', [web7]);
      const course = new Course([ch2, ch3, ch5, ch7]);
      const answer1 = new Answer(ch2, AnswerStatus.OK);
      const answer2 = new Answer(ch3, AnswerStatus.OK);
      const answer3 = new Answer(ch5, AnswerStatus.KO);

      // when
      const assessment = new Assessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    context.skip('when one challenge (level3) has been archived', () => {
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const ch1 = new Challenge('recEasy', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch3 = new Challenge('rec3', 'archive', [web3]);
      const ch3Bis = new Challenge('rec3bis', 'validé', [web3]);
      const ch4 = new Challenge('rec4', 'validé', [web4]);
      const ch5 = new Challenge('rec5', 'validé', [web5]);

      it('should return a challenge of level 3 if user got levels 1, 2 ,3 and 4 at KO', function() {
        // given
        const course = new Course([ch1, ch2, ch3, ch3Bis, ch4, ch5]);
        const answer1 = new Answer(ch1, AnswerStatus.OK);
        const answer2 = new Answer(ch2, AnswerStatus.OK);
        const answer3 = new Answer(undefined, AnswerStatus.OK);
        const answer4 = new Answer(ch4, AnswerStatus.KO);
        const assessment = new Assessment(course, [answer1, answer2, answer3, answer4]);

        // then
        expect(assessment.nextChallenge).to.equal(ch3Bis);
      });

      it('should return a challenge of level 5 if user got levels 1, 2, 3, 4 with OK', function() {
        // given
        const course = new Course([ch1, ch2, ch3, ch3Bis, ch4, ch5]);
        const answer1 = new Answer(ch1, AnswerStatus.OK);
        const answer2 = new Answer(ch2, AnswerStatus.OK);
        const answer3 = new Answer(undefined, AnswerStatus.OK);
        const answer4 = new Answer(ch4, AnswerStatus.OK);
        const assessment = new Assessment(course, [answer1, answer2, answer3, answer4]);

        // then
        expect(assessment.nextChallenge).to.equal(ch5);
      });
      it('should return a challenge of level 4 if user got levels 1, 2 and  3 archived', function() {
        // given
        const course = new Course([ch1, ch2, ch3, ch3Bis, ch4]);
        const answer1 = new Answer(ch1, AnswerStatus.OK);
        const answer2 = new Answer(ch2, AnswerStatus.OK);
        const answer3 = new Answer(undefined, AnswerStatus.OK);
        const assessment = new Assessment(course, [answer1, answer2, answer3]);

        // then
        expect(assessment.nextChallenge).to.equal(ch4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and 3 archived', function() {
        // given
        const course = new Course([ch1, ch2, ch3, ch3Bis]);
        const answer1 = new Answer(ch1, AnswerStatus.OK);
        const answer2 = new Answer(ch2, AnswerStatus.OK);
        const answer3 = new Answer(undefined, AnswerStatus.OK);
        const assessment = new Assessment(course, [answer1, answer2, answer3]);

        // then
        expect(assessment.nextChallenge).to.equal(ch3Bis);
      });
    });

    it.skip('should return null if remaining challenges do not provide extra validated or failed skills', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch3 = new Challenge('rec3', 'validé', [web2]);
      const course = new Course([ch1, ch2, ch3]);
      const answer = new Answer(ch2, AnswerStatus.OK);
      const assessment = new Assessment(course, [answer]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    it.skip('should return null if 20 challenges have been answered so far', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const challenges = [];
      const answers = [];
      for (let i = 0; i < 20; i++) {
        challenges.push(new Challenge('rec' + i, 'validé', [web1]));
        answers.push(new Answer(challenges[i], AnswerStatus.OK));
      }
      challenges.push(new Challenge('rec20', 'validé', [web2]));
      const course = new Course(challenges);
      const assessment = new Assessment(course, answers);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    it.skip('should call _firstChallenge function if the assessment has no answer', function() {
      // given
      const firstChallenge = new Challenge();
      const challenges = [];
      const course = new Course(challenges);
      const answers = [];
      const assessment = new Assessment(course, answers);
      const firstChallengeStub = sinon.stub(assessment, '_firstChallenge').get(() => firstChallenge);

      // then
      expect(assessment.nextChallenge).to.be.equal(firstChallenge);
      firstChallengeStub.restore();
    });

    it.skip('should return an easier challenge if user skipped previous challenge', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2a = new Challenge('rec2a', 'validé', [web2]);
      const ch2b = new Challenge('rec2b', 'validé', [web2]);
      const ch3 = new Challenge('rec3', 'validé', [web3]);
      const course = new Course([ch1, ch2a, ch2b, ch3]);
      const answer = new Answer(ch2a, AnswerStatus.SKIPPED);
      const assessment = new Assessment(course, [answer]);

      // then
      expect(assessment.nextChallenge.hardestSkill.difficulty).to.be.equal(1);
    });

    it.skip('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const url3 = new Skill('url3');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2a = new Challenge('rec2a', 'validé', [web2]);
      const ch3a = new Challenge('rec3a', 'validé', [web3]);
      const ch3b = new Challenge('rec3b', 'validé', [web3]);
      const ch3c = new Challenge('rec3c', 'validé', [url3]);
      const course = new Course([ch1, ch2a, ch3a, ch3b, ch3c]);
      const answer = new Answer(ch2a, AnswerStatus.OK);
      const assessment = new Assessment(course, [answer]);

      // then
      expect(assessment.nextChallenge.hardestSkill.difficulty).to.be.equal(3);
    });

    it.skip('should not return a question of level 6 after first answer is correct', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web4 = new Skill('web4');
      const web6 = new Skill('web6');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch4 = new Challenge('rec4', 'validé', [web4]);
      const ch6 = new Challenge('rec6', 'validé', [web6]);
      const challenges = [ch1, ch2, ch4, ch6];
      const course = new Course(challenges);
      const answer = new Answer(ch2, AnswerStatus.OK);
      const answers = [answer];
      const assessment = new Assessment(course, answers);

      // then
      expect(assessment.nextChallenge.skills[0].difficulty).not.to.be.equal(6);
    });

    it.skip('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web4 = new Skill('web4');
      const web6 = new Skill('web6');
      const web7 = new Skill('web7');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const ch4 = new Challenge('rec4', 'validé', [web4]);
      const ch6 = new Challenge('rec6', 'validé', [web6]);
      const ch7 = new Challenge('rec7', 'validé', [web7]);
      const challenges = [ch1, ch2, ch4, ch6, ch7];
      const course = new Course(challenges);
      const answer2 = new Answer(ch2, AnswerStatus.OK);
      const answer6 = new Answer(ch6, AnswerStatus.OK);
      const answers = [answer2, answer6];
      const assessment = new Assessment(course, answers);

      // then
      expect(assessment.nextChallenge.skills).to.be.deep.equal([web7]);
    });

    it.skip('should not select a challenge that is more than 2 levels above the predicted level', function() {
      // given
      const web2 = new Skill('web2');
      const url7 = new Skill('url7');
      const challengeWeb2 = new Challenge('rec2', 'validé', [web2]);
      const challengeUrl7 = new Challenge('rec7', 'validé', [url7]);
      const course = new Course([challengeWeb2, challengeUrl7]);
      const answer1 = new Answer(challengeWeb2, AnswerStatus.OK);

      // when
      const assessment = new Assessment(course, [answer1]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

  });
});
