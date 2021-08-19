const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const { CertificationComputeError } = require('../../../../lib/domain/errors');
const CertificationContract = require('../../../../lib/domain/models/CertificationContract');
const _ = require('lodash');

describe('Unit | Domain | Models | CertificationContract', function() {
  describe('#assertThatWeHaveEnoughAnswers', function() {
    describe('when there is less answers than challenges', function() {

      it('should throw', async function() {
        // given
        const answers = _.map([
          { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
          { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
        ], domainBuilder.buildAnswer);

        const challenges = _.map([
          { challengeId: 'challenge_A_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeA_1', type: 'QCM' },
          { challengeId: 'challenge_C_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeC_1', type: 'QCM' },
          { challengeId: 'challenge_B_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeB_1', type: 'QCM' },
          { challengeId: 'challenge_D_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeD_2', type: 'QCM' },
          { challengeId: 'challenge_E_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeE_2', type: 'QCM' },
        ], domainBuilder.buildCertificationChallengeWithType);

        // when
        const error = await catchErr(CertificationContract.assertThatWeHaveEnoughAnswers)(answers, challenges);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('L’utilisateur n’a pas répondu à toutes les questions');
      });
    });
  });

  describe('#assertThatCompetenceHasAtLeastOneChallenge', function() {
    describe('when there not enough challenges for one competence', function() {

      it('should throw', async function() {
        // given
        const competenceIndex = '1.1';

        const competenceChallenges = [];

        // when
        const error = await catchErr(CertificationContract.assertThatCompetenceHasAtLeastOneChallenge)(competenceChallenges, competenceIndex);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de challenges posés pour la compétence 1.1');
      });
    });
  });

  describe('#assertThatCompetenceHasAtLeastOneAnswer', function() {
    describe('when there is not enough answers for one competence', function() {

      it('should throw', async function() {
        // given
        const competenceIndex = '1.1';

        const competenceChallenges = [];

        // when
        const error = await catchErr(CertificationContract.assertThatCompetenceHasAtLeastOneAnswer)(competenceChallenges, competenceIndex);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de réponses pour la compétence 1.1');
      });
    });
  });

  describe('#assertThatScoreIsCoherentWithReproducibilityRate', function() {
    describe('when score is < 1 and reproductibility rate is > 50%', function() {

      it('should throw', async function() {
        // given
        const score = 0;

        const reproducibilityRate = 60;

        // when
        const error = await catchErr(CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate)(score, reproducibilityRate);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Rejeté avec un taux de reproductibilité supérieur à 50');
      });
    });
  });

  describe('#assertThatEveryAnswerHasMatchingChallenge', function() {
    describe('when an answer does not match a challenge', function() {

      it('should throw', async function() {
        // given
        const answers = _.map([
          { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
          { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
        ], domainBuilder.buildAnswer);

        const challenges = _.map([
          { challengeId: 'challenge_A_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeA_1', type: 'QCM' },
          { challengeId: 'challenge_C_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeC_1', type: 'QCM' },
          { challengeId: 'challenge_B_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeB_1', type: 'QCM' },
          { challengeId: 'challenge_D_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeD_2', type: 'QCM' },
        ], domainBuilder.buildCertificationChallengeWithType);

        // when
        const error = await catchErr(CertificationContract.assertThatEveryAnswerHasMatchingChallenge)(answers, challenges);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Problème de chargement du challenge challenge_E_for_competence_2');
      });
    });
  });

  describe('#assertThatNoChallengeHasMoreThanOneAnswer', function() {
    describe('when there are several answers for the same challenge', function() {

      it('should throw', async function() {
        // given
        const answers = _.map([
          { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
          { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
          { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
        ], domainBuilder.buildAnswer);

        // when
        const error = await catchErr(CertificationContract.assertThatNoChallengeHasMoreThanOneAnswer)(answers);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Plusieurs réponses pour une même épreuve');
      });
    });
  });
});
