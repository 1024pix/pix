const { expect, domainBuilder } = require('../../../../test-helper');
const Answer = require('../../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const Tube = require('../../../../../lib/domain/models/Tube');
const scoringFormulas = require('../../../../../lib/domain/strategies/scoring/scoring-formulas');

describe('Unit | Domain | strategies | scoring | scoring-formulas', () => {

  describe('#computeAnswersSuccessRate', () => {

    context('when no answers is given', () => {

      it('should have a trust level has unknown', () => {
        // given
        const answers = [];

        // when
        const successRate = scoringFormulas.computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when all answers are OK', () => {

      it('should has a success rate at 100%', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ok' })];

        // when
        const successRate = scoringFormulas.computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(100);
      });
    });

    context('when all answers are KO', () => {

      it('should has a success rate at 0%', () => {
        // given
        const answers = [new Answer({ result: 'ko' }), new Answer({ result: 'ko' })];

        // when
        const successRate = scoringFormulas.computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when the answers are a mixed of valid and wrong answers', () => {

      it('should has a success rate at 50% with 1W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ko' })];

        // when
        const successRate = scoringFormulas.computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(50);
      });

      it('should has a success rate at 50% with 2W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: '#ABAND#' }), new Answer({ result: 'ko' })];

        // when
        const successRate = scoringFormulas.computeAnswersSuccessRate(answers);

        // then
        expect(successRate).to.be.within(33.333333, 33.333334);
      });

    });
  });

  describe('#computeObtainedPixScore', () => {

    it('should be 0 if no skill has been validated', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const competenceSkills = [skill_web1, skill_web2, skill_web3];

      // when
      const score = scoringFormulas.computeObtainedPixScore(competenceSkills, []);

      // then
      expect(score).to.equal(0);
    });

    it('should be 8 pix if validated skills are web1 among 2 (4 pix), web2 (4 pix) but not web3 among 4 (2 pix)', () => {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const competenceSkills = [skill_web1, skill_web2, skill_web3];

      // when
      const score = scoringFormulas.computeObtainedPixScore(competenceSkills, [skill_web1, skill_web2]);

      // then
      expect(score).to.equal(8);
    });

    it('should be 6 if validated skills are web1 (4 pix) and fou3 among 4 (2 pix) (web2 was failed)', () => {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const skill_chi3 = domainBuilder.buildSkill({ name: '@chi3' });
      const skill_fou3 = domainBuilder.buildSkill({ name: '@fou3' });
      const competenceSkills = [skill_web1, skill_web2, skill_web3, skill_fou3, skill_chi3];

      // when
      const score = scoringFormulas.computeObtainedPixScore(competenceSkills, [skill_web1, skill_fou3]);

      // then
      expect(score).to.equal(6);
    });
  });

  describe('#computeTotalPixScore', () => {

    it('should sum all valid pix scores', function() {
      // given
      const pixScores = [8, 12, undefined, null];

      // when
      const totalPixScore = scoringFormulas.computeTotalPixScore(pixScores);

      // then
      expect(totalPixScore).to.equal(20);
    });

    it('should return 0 when there is no pix scores', function() {
      // given
      const pixScores = [];

      // when
      const totalPixScore = scoringFormulas.computeTotalPixScore(pixScores);

      // then
      expect(totalPixScore).to.equal(0);
    });

    it('should sum all pix scores', function() {
      // given
      const pixScores = [8, 12, 11, 5];

      // when
      const totalPixScore = scoringFormulas.computeTotalPixScore(pixScores);

      // then
      expect(totalPixScore).to.equal(36);
    });
  });

  describe('#computeLevel', () => {

    it('should be 0 if pixScore is 7.98', function() {
      // given
      const pixScore = 7.98;

      // when
      const level = scoringFormulas.computeLevel(pixScore);

      // then
      expect(level).to.equal(0);
    });

    it('should be 1 if pixScore is 8.02', function() {
      // given
      const pixScore = 8.02;

      // when
      const level = scoringFormulas.computeLevel(pixScore);

      // then
      expect(level).to.equal(1);
    });
  });

  describe('#computeCeilingLevel', () => {

    it('should be 2 if level is 2', function() {
      // given
      const level = 2;

      // when
      const ceilingLevel = scoringFormulas.computeCeilingLevel(level);

      // then
      expect(ceilingLevel).to.equal(2);
    });

    it('should be 5 even if level is 48 (level 6 must not be reachable for the moment)', function() {
      // given
      const level = 48;

      // when
      const ceilingLevel = scoringFormulas.computeCeilingLevel(level);

      // then
      expect(ceilingLevel).to.equal(5);
    });
  });

  describe('#getValidatedSkills', () => {

    it('should return [web1, web2] if the user answered correctly a question that requires web2', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const skills = [skill_web1, skill_web2, skill_web3];

      const challenge = domainBuilder.buildChallenge({ skills: [skill_web2] });
      const challenges = [challenge];

      const answer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
      const answers = [answer];

      const tube = new Tube({ skills });
      const tubes = [tube];

      // when
      const validatedSkills = scoringFormulas.getValidatedSkills(answers, challenges, tubes);

      // then
      expect(validatedSkills).to.deep.equal([skill_web1, skill_web2]);
    });

    it('should not have the same skill validated twice', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const skills = [skill_web1, skill_web2, skill_web3];

      const challenge1 = domainBuilder.buildChallenge({ skills: [skill_web1] });
      const challenge2 = domainBuilder.buildChallenge({ skills: [skill_web2] });
      const challenges = [challenge1, challenge2];

      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.id, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.id, result: AnswerStatus.OK });
      const answers = [answer1, answer2];

      const tube = new Tube({ skills });
      const tubes = [tube];

      // when
      const validatedSkills = scoringFormulas.getValidatedSkills(answers, challenges, tubes);

      // then
      expect(validatedSkills).to.deep.equal([skill_web1, skill_web2]);
    });

    it('should not have failed skills validated', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const skills = [skill_web1, skill_web2, skill_web3];

      const challenge1 = domainBuilder.buildChallenge({ skills: [skill_web1] });
      const challenge2 = domainBuilder.buildChallenge({ skills: [skill_web2] });
      const challenges = [challenge1, challenge2];

      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge1.id, result: AnswerStatus.OK });
      const answer2 = domainBuilder.buildAnswer({ challengeId: challenge2.id, result: AnswerStatus.KO });
      const answers = [answer1, answer2];

      const tube = new Tube({ skills });
      const tubes = [tube];

      // when
      const validatedSkills = scoringFormulas.getValidatedSkills(answers, challenges, tubes);

      // then
      expect(validatedSkills).to.deep.equal([skill_web1]);
    });

    context('when one challenge was archived', () => {

      it('should validate skills even if one answer has undefined challenge and skill do not exist anymore', () => {
        // given
        const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
        const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
        const skill_chi1 = domainBuilder.buildSkill({ name: '@chi1' });
        const skill_chi2 = domainBuilder.buildSkill({ name: '@chi2' });
        const skill_chi3 = domainBuilder.buildSkill({ name: '@chi3' });
        const skill_truc2 = domainBuilder.buildSkill({ name: '@truc2' });
        const competenceSkills = [skill_web1, skill_web3, skill_chi1, skill_chi2, skill_chi3, skill_truc2];

        const challenge_web1 = domainBuilder.buildChallenge({ skills: [skill_web1] });
        const challenge_web3 = domainBuilder.buildChallenge({ skills: [skill_web3] });
        const challenge_chi1 = domainBuilder.buildChallenge({ skills: [skill_chi1] });
        const challenge_chi2 = domainBuilder.buildChallenge({ skills: [skill_chi2], status: 'archived' });
        const challenge_chi3 = domainBuilder.buildChallenge({ skills: [skill_chi3] });
        const challenge_truc2 = domainBuilder.buildChallenge({ skills: [skill_truc2] });
        const challenges = [challenge_web1, challenge_web3, challenge_chi1, challenge_chi2, challenge_chi3, challenge_truc2];

        const answer_web1 = domainBuilder.buildAnswer({ challengeId: challenge_web1.id, result: AnswerStatus.OK });
        const answer_web3 = domainBuilder.buildAnswer({ challengeId: challenge_web3.id, result: AnswerStatus.OK });
        const answer_chi1 = domainBuilder.buildAnswer({ challengeId: challenge_chi1.id, result: AnswerStatus.OK });
        const answer_chi2 = domainBuilder.buildAnswer({ challengeId: challenge_chi2.id, result: AnswerStatus.OK });
        const answer_chi3 = domainBuilder.buildAnswer({ challengeId: challenge_chi3.id, result: AnswerStatus.OK });
        const answer_truc2 = domainBuilder.buildAnswer({ challengeId: challenge_truc2.id, result: AnswerStatus.OK });
        const undefined_answer = domainBuilder.buildAnswer({ challengeId: null, result: AnswerStatus.OK });
        const answers = [answer_web1, answer_web3, answer_chi1, answer_chi2, answer_chi3, answer_truc2, undefined_answer];

        const tube_web = new Tube({ skills: [skill_web1, skill_web3] });
        const tube_chi = new Tube({ skills: [skill_chi1, skill_chi2, skill_chi3] });
        const tube_truc = new Tube({ skills: [skill_truc2] });
        const tubes = [tube_web, tube_chi, tube_truc];

        // when
        const validatedSkills = scoringFormulas.getValidatedSkills(answers, challenges, tubes);

        // then
        expect(validatedSkills).to.deep.equal(competenceSkills);
      });

      it('should validate skills score even if one answer has undefined challenge and but skill exist', () => {
        // given
        const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
        const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
        const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
        const skill_chi1 = domainBuilder.buildSkill({ name: '@chi1' });
        const skill_chi2 = domainBuilder.buildSkill({ name: '@chi2' });
        const skill_chi3 = domainBuilder.buildSkill({ name: '@chi3' });
        const competenceSkills = [skill_web1, skill_web2, skill_web3, skill_chi1, skill_chi2, skill_chi3];

        const challenge_web1 = domainBuilder.buildChallenge({ skills: [skill_web1] });
        const challenge_web2 = domainBuilder.buildChallenge({ skills: [skill_web2] });
        const challenge_web3 = domainBuilder.buildChallenge({ skills: [skill_web3] });
        const challenge_chi1 = domainBuilder.buildChallenge({ skills: [skill_chi1] });
        const challenge_chi2 = domainBuilder.buildChallenge({ skills: [skill_chi2], status: 'archived' });
        const challenge_chi3 = domainBuilder.buildChallenge({ skills: [skill_chi3] });
        const challenges = [challenge_web1, challenge_web2, challenge_web3, challenge_chi1, challenge_chi2, challenge_chi3];

        const answer_web1 = domainBuilder.buildAnswer({ challengeId: challenge_web1.id, result: AnswerStatus.OK });
        const answer_web2_archived = domainBuilder.buildAnswer({ challengeId: null, result: AnswerStatus.OK });
        const answer_web3 = domainBuilder.buildAnswer({ challengeId: challenge_web3.id, result: AnswerStatus.OK });
        const answer_chi1 = domainBuilder.buildAnswer({ challengeId: challenge_chi1.id, result: AnswerStatus.OK });
        const answer_chi2 = domainBuilder.buildAnswer({ challengeId: challenge_chi2.id, result: AnswerStatus.OK });
        const answer_chi3 = domainBuilder.buildAnswer({ challengeId: challenge_chi3.id, result: AnswerStatus.OK });
        const answers = [answer_web1, answer_web2_archived, answer_web3, answer_chi1, answer_chi2, answer_chi3];

        const tube_web = new Tube({ skills: [skill_web1, skill_web2, skill_web3] });
        const tube_chi = new Tube({ skills: [skill_chi1, skill_chi2, skill_chi3] });
        const tubes = [tube_web, tube_chi];

        // when
        const validatedSkills = scoringFormulas.getValidatedSkills(answers, challenges, tubes);

        // then
        expect(validatedSkills).to.deep.equal(competenceSkills);
      });
    });
  });

  describe('#getFailedSkills', () => {

    it('should return [web1, web2, web3] if the user fails a question that requires web1', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const skills = [skill_web1, skill_web2, skill_web3];

      const challenge = domainBuilder.buildChallenge({ skills: [skill_web1] });
      const challenges = [challenge];

      const answer1 = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      const answers = [answer1];

      const tube = new Tube({ skills });
      const tubes = [tube];

      // when
      const failedSkills = scoringFormulas.getFailedSkills(answers, challenges, tubes);

      // then
      expect(failedSkills).to.deep.equal(skills);
    });
  });
});
