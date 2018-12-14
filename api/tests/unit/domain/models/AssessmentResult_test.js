const { domainBuilder, expect } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Tube = require('../../../../lib/domain/models/Tube');

describe('Unit | Domain | Models | AssessmentResults', () => {

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
      const validatedSkills = AssessmentResult.GetValidatedSkills(answers, challenges, tubes);

      // then
      expect([...validatedSkills]).to.deep.equal([skill_web1, skill_web2]);
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
      const validatedSkills = AssessmentResult.GetValidatedSkills(answers, challenges, tubes);

      // then
      expect([...validatedSkills]).to.deep.equal([skill_web1, skill_web2]);
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
      const failedSkills = AssessmentResult.GetFailedSkills(answers, challenges, tubes);

      // then
      expect([...failedSkills]).to.deep.equal(skills);
    });
  });

  describe('#ComputePixScore', () => {

    it('should be 0 if no skill has been validated', function() {
      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const competenceSkills = [skill_web1, skill_web2, skill_web3];

      const challenge_1_2 = domainBuilder.buildChallenge({ skills: [skill_web1, skill_web2] });
      const challenge_3 = domainBuilder.buildChallenge({ skills: [skill_web3] });
      const challenges = [challenge_1_2, challenge_3];

      const answer_1_2 = domainBuilder.buildAnswer({ challengeId: challenge_1_2.id, result: AnswerStatus.KO });
      const answer_3 = domainBuilder.buildAnswer({ challengeId: challenge_3.id, result: AnswerStatus.KO });
      const answers = [answer_1_2, answer_3];

      const tube = new Tube({ skills: competenceSkills });
      const tubes = [tube];

      // when
      const score = AssessmentResult.ComputePixScore(competenceSkills, challenges, answers, tubes);

      // then
      expect(score).to.equal(0);
    });

    it('should be 8 pix if validated skills are web1 among 2 (4 pix), web2 (4 pix) but not web3 among 4 (2 pix)', () => {

      // given
      const skill_web1 = domainBuilder.buildSkill({ name: '@web1' });
      const skill_web2 = domainBuilder.buildSkill({ name: '@web2' });
      const skill_web3 = domainBuilder.buildSkill({ name: '@web3' });
      const competenceSkills = [skill_web1, skill_web2, skill_web3];

      const challenge_1_2 = domainBuilder.buildChallenge({ skills: [skill_web1, skill_web2] });
      const challenge_3 = domainBuilder.buildChallenge({ skills: [skill_web3] });
      const challenges = [challenge_1_2, challenge_3];

      const answer_1_2 = domainBuilder.buildAnswer({ challengeId: challenge_1_2.id, result: AnswerStatus.OK });
      const answer_3 = domainBuilder.buildAnswer({ challengeId: challenge_3.id, result: AnswerStatus.KO });
      const answers = [answer_1_2, answer_3];

      const tube = new Tube({ skills: competenceSkills });
      const tubes = [tube];

      // when
      const score = AssessmentResult.ComputePixScore(competenceSkills, challenges, answers, tubes);

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

      const challenge_web1 = domainBuilder.buildChallenge({ skills: [skill_web1] });
      const challenge_web2 = domainBuilder.buildChallenge({ skills: [skill_web2] });
      const challenge_fou3 = domainBuilder.buildChallenge({ skills: [skill_fou3] });
      const challenges = [challenge_web1, challenge_web2, challenge_fou3];

      const answer_web1 = domainBuilder.buildAnswer({ challengeId: challenge_web1.id, result: AnswerStatus.OK });
      const answer_web2 = domainBuilder.buildAnswer({ challengeId: challenge_web2.id, result: AnswerStatus.KO });
      const answer_fou3 = domainBuilder.buildAnswer({ challengeId: challenge_fou3.id, result: AnswerStatus.OK });
      const answers = [answer_web1, answer_web2, answer_fou3];

      const tube_web = new Tube({ skills: [skill_web1, skill_web2, skill_web3] });
      const tube_chi = new Tube({ skills: [skill_chi3] });
      const tube_fou = new Tube({ skills: [skill_fou3] });
      const tubes = [tube_web, tube_chi, tube_fou];

      // when
      const score = AssessmentResult.ComputePixScore(competenceSkills, challenges, answers, tubes);

      // then
      expect(score).to.equal(6);
    });

    context('when one challenge was archived', () => {

      it('should return maximum score even if one answer has undefined challenge and skill do not exist anymore', () => {

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
        const score = AssessmentResult.ComputePixScore(competenceSkills, challenges, answers, tubes);

        // then
        expect(score).to.equal(24);
      });

      it('should return maximum score even if one answer has undefined challenge and but skill exist', () => {

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
        const score = AssessmentResult.ComputePixScore(competenceSkills, challenges, answers, tubes);

        // then
        expect(score).to.equal(24);
      });
    });
  });

  describe('#computeLevel', () => {

    it('should be 0 if pixScore is 7.98', function() {
      // given
      const pixScore = 7.98;

      // when
      const level = AssessmentResult.ComputeLevel(pixScore);

      // then
      expect(level).to.equal(0);
    });

    it('should be 1 if pixScore is 8.02', function() {
      // given
      const pixScore = 8.02;

      // when
      const level = AssessmentResult.ComputeLevel(pixScore);

      // then
      expect(level).to.equal(1);
    });
  });

  describe('#computeCeilingLevel', () => {

    it('should be 2 if level is 2', function() {
      // given
      const level = 2;

      // when
      const ceilingLevel = AssessmentResult.ComputeCeilingLevel(level);

      // then
      expect(ceilingLevel).to.equal(2);
    });

    it('should be 5 even if level is 48 (level 6 must not be reachable for the moment)', function() {
      // given
      const level = 48;

      // when
      const ceilingLevel = AssessmentResult.ComputeCeilingLevel(level);

      // then
      expect(ceilingLevel).to.equal(5);
    });
  });
});
