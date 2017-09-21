const { expect, sinon } = require('../../test-helper');
const Course = require('../../../lib/cat/course');
const Assessment = require('../../../lib/cat/assessment');
const Answer = require('../../../lib/cat/answer');
const Challenge = require('../../../lib/cat/challenge');
const Skill = require('../../../lib/cat/skill');

describe('Unit | Model | Assessment', function() {

  describe('#_probaOfCorrectAnswer()', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment._probaOfCorrectAnswer).to.exist;
    });

    it('should return 1/2 if difficulty equals level', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // when
      const proba = assessment._probaOfCorrectAnswer(3, 3);

      // then
      expect(proba).to.equal(0.5);
    });

    it('should return something lesser than 1/2 if difficulty is higher than level', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // when
      const proba = assessment._probaOfCorrectAnswer(3, 4);

      // then
      expect(proba).to.be.below(0.5);
    });
  });

  describe('#_computeLikelihood()', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment._computeLikelihood).to.exist;
    });

    it('should return likelihood values for different levels', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const ch1 = new Challenge('a', 'validé', [web4]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new Answer(ch1, 'ok');
      const answer2 = new Answer(ch2, 'ko');
      const answers = [answer1, answer2];
      const course = new Course(challenges);
      const assessment = new Assessment(course, answers);

      // when
      const likelihoodValues = [3.5, 4.5, 5.5].map(level => assessment._computeLikelihood(level, assessment.answers));

      // then
      expect(likelihoodValues).to.deep.equal([-0.44003380739549824, -0, -0.44003380739549824]);
    });

    it('should return negative values every time', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const ch1 = new Challenge('a', 'validé', [web4]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new Answer(ch1, 'ok');
      const answer2 = new Answer(ch2, 'ko');
      const answers = [answer1, answer2];
      const course = new Course(challenges);
      const assessment = new Assessment(course, answers);

      // when
      const likelihoodValues = [1.2, 3.4, 5.6].map(level => assessment._computeLikelihood(level, assessment.answers));

      // then
      likelihoodValues.forEach(likelihoodValue => expect(likelihoodValue).to.be.below(0));
    });
  });

  describe('#estimatedLevel', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.estimatedLevel).to.exist;
    });

    it('should return 2 if user did not provide any answers so far', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.estimatedLevel).to.be.equal(2);
    });

    it('should return 4.5 if user answered correctly a question of maxDifficulty 4 but failed at 5', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const ch1 = new Challenge('a', 'validé', [web4]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const answer1 = new Answer(ch1, 'ok');
      const answer2 = new Answer(ch2, 'ko');
      const answers = [answer1, answer2];
      const course = new Course(challenges);
      const assessment = new Assessment(course, answers);

      // when
      const estimatedLevel = assessment.estimatedLevel;

      // then
      expect(estimatedLevel).to.equal(4.5);
    });
  });

  describe('#validatedSkills', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.validatedSkills).to.exist;
    });

    it('should return [web1, web3] if the user answered correctly a question that requires web3', function() {
      // given
      const web1 = new Skill('web1');
      const web3 = new Skill('web3');
      const url3 = new Skill('url3');
      const url4 = new Skill('url4');
      const url5 = new Skill('url5');
      const url6 = new Skill('url6');
      const ch1 = new Challenge('a', 'validé', [web3]);
      const ch2 = new Challenge('b', 'validé', [web1, web3, url3, url4, url5, url6]);
      const course = new Course([ch1, ch2]);
      const answer = new Answer(ch1, 'ok');
      const assessment = new Assessment(course, [answer]);

      // then
      expect([...assessment.validatedSkills]).to.be.deep.equal([web1, web3]);
    });
  });

  describe('#failedSkills', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.failedSkills).to.exist;
    });

    it('should return [url5, url6, url8] if the user fails a question that requires web1 and url5', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const url3 = new Skill('url3');
      const url4 = new Skill('url4');
      const url5 = new Skill('url5');
      const url6 = new Skill('url6');
      const url8 = new Skill('url8');
      const ch1 = new Challenge('a', 'validé', [web1, url5]);
      const ch2 = new Challenge('b', 'validé', [web2, web3, url3, url4, url6, url8]);
      const course = new Course([ch1, ch2]);
      const answer = new Answer(ch1, 'ko');
      const assessment = new Assessment(course, [answer]);

      // then
      expect([...assessment.failedSkills]).to.be.deep.equal([url5, url6, url8]);
    });
  });

  describe('#filteredChallenges', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.filteredChallenges).to.exist;
    });

    it('should return challenges that have not been already answered', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const url3 = new Skill('url3');
      const ch1 = new Challenge('a', 'validé', [web1]);
      const ch2 = new Challenge('b', 'validé', [web2]);
      const ch3 = new Challenge('c', 'validé', [url3]);
      const answerCh2 = new Answer(ch2, 'ok');
      const answerCh3 = new Answer(ch3, 'ok');
      const challenges = [ch1, ch2, ch3];
      const course = new Course(challenges);
      const assessment = new Assessment(course, [answerCh2, answerCh3]);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([ch1]);
    });

    it('should return an empty array when all challenges have been answered', function() {
      // given
      const web1 = new Skill('web1');
      const ch1 = new Challenge('a', 'validé', [web1]);
      const answerCh1 = new Answer(ch1, 'ok');
      const course = new Course([ch1]);
      const assessment = new Assessment(course, [answerCh1]);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([]);
    });

    it('should return only challenges that are validated, prevalidated, or validated without test', function() {
      // given
      const drop1 = new Challenge('a', 'poubelle', []);
      const keep1 = new Challenge('b', 'validé', []);
      const keep2 = new Challenge('c', 'pré-validé', []);
      const drop2 = new Challenge('d', 'archive', []);
      const drop3 = new Challenge('e', 'proposé', []);
      const keep3 = new Challenge('f', 'validé sans test', []);
      const course = new Course([keep1, keep2, keep3, drop1, drop2, drop3]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.filteredChallenges).to.deep.equal([keep1, keep2, keep3]);
    });
  });

  describe('#_computeReward()', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment._computeReward).to.exist;
    });

    it('should be 2 if challenge requires web2 within web1-2-3 and no answer has been given yet', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const ch1 = new Challenge('recXXX', 'validé', [web2]);
      const ch2 = new Challenge('recYYY', 'validé', [web1, web3]);
      const course = new Course([ch1, ch2]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment._computeReward(ch1)).to.equal(2);
    });

    it('should be 2.73 if challenge requires url3 within url2-3-4-5 and no answer has been given yet', function() {
      // given
      const url2 = new Skill('url2');
      const url3 = new Skill('url3');
      const url4 = new Skill('url4');
      const url5 = new Skill('url5');
      const ch1 = new Challenge('recXXX', 'validé', [url3]);
      const ch2 = new Challenge('recYYY', 'validé', [url2, url4, url5]);
      const course = new Course([ch1, ch2]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment._computeReward(ch1)).to.equal(2.7310585786300052);
    });
  });

  describe('#nextChallenge', function() {
    it('should exist', function() {
      // given
      const web1 = new Skill('web1');
      const challenge = new Challenge('recXXX', 'validé', [web1]);
      const course = new Course([challenge]);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.nextChallenge).to.exist;
    });

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const web3 = new Skill('web3');
      const ch1 = new Challenge('a', 'validé', [web1]);
      const ch2 = new Challenge('b', 'validé', [web2]);
      const ch3 = new Challenge('c', 'validé', [web3]);
      const challenges = [ch1, ch2, ch3];
      const course = new Course(challenges);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.nextChallenge).to.equal(ch2);
    });

    it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
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
      const answer1 = new Answer(ch2, 'ok');
      const answer2 = new Answer(ch4, 'ok');
      const answer3 = new Answer(ch6, 'ko');
      const assessment = new Assessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.nextChallenge).to.equal(ch5);
    });

    it('should return null if remaining challenges do not provide extra validated or failed skills', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const ch1 = new Challenge('rec1', 'validé', [web1]);
      const ch2 = new Challenge('rec2', 'validé', [web2]);
      const course = new Course([ch1, ch2]);
      const answer = new Answer(ch2, 'ok');
      const assessment = new Assessment(course, [answer]);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });

    it('should return null if 20 challenges have been answered so far', function() {
      // given
      const web1 = new Skill('web1');
      const web2 = new Skill('web2');
      const challenges = [];
      const answers = [];
      for (let i = 0; i < 20; i++) {
        challenges.push(new Challenge('rec' + i, 'validé', [web1]));
        answers.push(new Answer(challenges[i], 'ok'));
      }
      challenges.push(new Challenge('rec20', 'validé', [web2]));
      const course = new Course(challenges);
      const assessment = new Assessment(course, answers);

      // then
      expect(assessment.nextChallenge).to.equal(null);
    });
  });

  describe('#pixScore', function() {
    it('should exist', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);

      // then
      expect(assessment.pixScore).to.exist;
    });

    it('should be 0 if no skill has been validated', function() {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = {};
      skillNames.forEach(skillName => skills[skillName] = new Skill(skillName));
      const competenceSkills = new Set(Object.values(skills));
      const ch1 = new Challenge('a', 'validé', [skills['web1'], skills['web2']]);
      const ch2 = new Challenge('b', 'validé', [skills['web3']]);
      const course = new Course([ch1, ch2], competenceSkills);
      const answer1 = new Answer(ch1, 'ko');
      const answer2 = new Answer(ch2, 'ko');
      const assessment = new Assessment(course, [answer1, answer2]);

      // then
      expect(assessment.pixScore).to.be.equal(0);
    });

    it('should be 8 if validated skills are web1 among 2 (4 pix), web2 (4 pix) but not web3 among 4 (2 pix)', function() {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = {};
      skillNames.forEach(skillName => skills[skillName] = new Skill(skillName));
      const competenceSkills = new Set(Object.values(skills));
      const ch1 = new Challenge('a', 'validé', [skills['web1'], skills['web2']]);
      const ch2 = new Challenge('b', 'validé', [skills['web3']]);
      const course = new Course([ch1, ch2], competenceSkills);
      const answer1 = new Answer(ch1, 'ok');
      const answer2 = new Answer(ch2, 'ko');
      const assessment = new Assessment(course, [answer1, answer2]);

      // then
      expect(assessment.pixScore).to.be.equal(8);
    });

    it('should be 6 if validated skills are web1 (4 pix) and fou3 among 4 (2 pix) (web2 was failed)', function() {
      // given
      const skillNames = ['web1', 'chi1', 'web2', 'web3', 'chi3', 'fou3', 'mis3'];
      const skills = {};
      skillNames.forEach(skillName => skills[skillName] = new Skill(skillName));
      const competenceSkills = new Set(Object.values(skills));
      const ch1 = new Challenge('a', 'validé', [skills['web1']]);
      const ch2 = new Challenge('b', 'validé', [skills['web2']]);
      const ch3 = new Challenge('c', 'validé', [skills['fou3']]);
      const course = new Course([ch1, ch2, ch3], competenceSkills);
      const answer1 = new Answer(ch1, 'ok');
      const answer2 = new Answer(ch2, 'ko');
      const answer3 = new Answer(ch3, 'ok');
      const assessment = new Assessment(course, [answer1, answer2, answer3]);

      // then
      expect(assessment.pixScore).to.be.equal(6);
    });
  });

  describe('#displayedPixScore', function() {

    it('should be 7 if pixScore is 7.98', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 7.98);

      // then
      expect(assessment.displayedPixScore).to.equal(7);
    });

    it('should be 8 if pixScore is 8.02', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 8.02);

      // then
      expect(assessment.displayedPixScore).to.equal(8);
    });
  });

  describe('#obtainedLevel', function() {

    it('should be 0 if pixScore is 7.98', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 7.98);

      // then
      expect(assessment.obtainedLevel).to.equal(0);
    });

    it('should be 1 if pixScore is 8.02', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 8.02);

      // then
      expect(assessment.obtainedLevel).to.equal(1);
    });

    it('should be 5 even if pixScore is 48 (level 6 must not be reachable for the moment)', function() {
      // given
      const course = new Course([], []);
      const assessment = new Assessment(course, []);
      sinon.stub(assessment, 'pixScore').get(() => 48);

      // then
      expect(assessment.obtainedLevel).to.equal(5);
    });

  });

  describe('Set', () => {

    describe('#union', () => {

      it('should concatenate two Set objects', () => {
        // given
        const setA = new Set([1, 2, 3]);
        const setB = new Set([4, 5, 6]);

        // when
        const setC = setA.union(setB);

        // then
        const expectedSet = new Set([1, 2, 3, 4, 5, 6]);
        expect(setC).to.deep.equal(expectedSet);
      });
    });

    describe('#difference', () => {

      it('should remove the Set values from another one', () => {
        // given
        const setA = new Set([1, 2, 3, 4, 5, 6]);
        const setB = new Set([1, 3, 5, 7]);

        // when
        const setC = setA.difference(setB);

        // then
        const expectedSet = new Set([2, 4, 6]);
        expect(setC).to.deep.equal(expectedSet);
      });
    });

  });

});
