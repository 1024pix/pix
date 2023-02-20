import { expect, domainBuilder, catchErr } from '../../../test-helper';
import { CertificationComputeError } from '../../../../lib/domain/errors';
import CertificationContract from '../../../../lib/domain/models/CertificationContract';
import _ from 'lodash';

describe('Unit | Domain | Models | CertificationContract', function () {
  context('#assertThatWeHaveEnoughAnswers', function () {
    context('when there are unanswered challenges', function () {
      it('should throw', async function () {
        // given
        const answers = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
          ],
          domainBuilder.buildAnswer
        );

        const challenges = _.map(
          [
            {
              challengeId: 'challenge_A_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeA_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_C_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeC_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_B_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeB_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_D_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeD_2',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_E_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeE_2',
              type: 'QCM',
            },
          ],
          domainBuilder.buildCertificationChallengeWithType
        );

        // when
        const error = await catchErr(CertificationContract.assertThatWeHaveEnoughAnswers)(answers, challenges);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal(
          "L’utilisateur n’a pas répondu à toutes les questions, alors qu'aucune raison d'abandon n'a été fournie."
        );
      });

      it('should not throw', async function () {
        // given
        const answers = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
          ],
          domainBuilder.buildAnswer
        );

        const challenges = _.map(
          [
            {
              challengeId: 'challenge_A_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeA_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_B_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeB_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_C_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeC_1',
              type: 'QCM',
              hasBeenSkippedAutomatically: true,
            },
            {
              challengeId: 'challenge_D_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeD_2',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_E_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeE_2',
              type: 'QCM',
            },
          ],
          domainBuilder.buildCertificationChallengeWithType
        );

        // when
        // then
        expect(() => CertificationContract.assertThatWeHaveEnoughAnswers(answers, challenges)).not.to.throw();
      });
    });
  });

  context('#assertThatCompetenceHasAtLeastOneChallenge', function () {
    context('when there not enough challenges for one competence', function () {
      it('should throw', async function () {
        // given
        const competenceIndex = '1.1';

        const competenceChallenges = [];

        // when
        const error = await catchErr(CertificationContract.assertThatCompetenceHasAtLeastOneChallenge)(
          competenceChallenges,
          competenceIndex
        );

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de challenges posés pour la compétence 1.1');
      });
    });
  });

  context('#assertThatScoreIsCoherentWithReproducibilityRate', function () {
    context('when score is < 1 and reproductibility rate is > 50%', function () {
      it('should throw', async function () {
        // given
        const score = 0;

        const reproducibilityRate = 60;

        // when
        const error = await catchErr(CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate)(
          score,
          reproducibilityRate
        );

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Rejeté avec un taux de reproductibilité supérieur à 50');
      });
    });
  });

  context('#assertThatEveryAnswerHasMatchingChallenge', function () {
    context('when an answer does not match a challenge', function () {
      it('should throw', async function () {
        // given
        const answers = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
          ],
          domainBuilder.buildAnswer
        );

        const challenges = _.map(
          [
            {
              challengeId: 'challenge_A_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeA_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_C_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeC_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_B_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeB_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_D_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeD_2',
              type: 'QCM',
            },
          ],
          domainBuilder.buildCertificationChallengeWithType
        );

        // when
        const error = await catchErr(CertificationContract.assertThatEveryAnswerHasMatchingChallenge)(
          answers,
          challenges
        );

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Problème de chargement du challenge challenge_E_for_competence_2');
      });
    });
  });

  context('#assertThatNoChallengeHasMoreThanOneAnswer', function () {
    context('when there are several answers for the same challenge', function () {
      it('should throw', async function () {
        // given
        const answers = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
          ],
          domainBuilder.buildAnswer
        );

        // when
        const error = await catchErr(CertificationContract.assertThatNoChallengeHasMoreThanOneAnswer)(answers);

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Plusieurs réponses pour une même épreuve');
      });
    });
  });

  describe('#hasEnoughNonNeutralizedChallengesToBeTrusted', function () {
    context('when certification has more than 66% of non neutralized challenges', function () {
      it('should return true', function () {
        // given
        const numberOfChallenges = 15;
        const numberOfNonNeutralizedChallenges = 10;

        // when
        const hasEnoughNonNeutralizedChallengeToBeTrusted =
          CertificationContract.hasEnoughNonNeutralizedChallengesToBeTrusted(
            numberOfChallenges,
            numberOfNonNeutralizedChallenges
          );

        // then
        expect(hasEnoughNonNeutralizedChallengeToBeTrusted).to.be.true;
      });
    });

    context('when certification has less than 66% of non neutralized challenges', function () {
      it('should return false', function () {
        // given
        const numberOfChallenges = 15;
        const numberOfNonNeutralizedChallenges = 9;

        // when
        const hasEnoughNonNeutralizedChallengeToBeTrusted =
          CertificationContract.hasEnoughNonNeutralizedChallengesToBeTrusted(
            numberOfChallenges,
            numberOfNonNeutralizedChallenges
          );

        // then
        expect(hasEnoughNonNeutralizedChallengeToBeTrusted).to.be.false;
      });
    });
  });
});
