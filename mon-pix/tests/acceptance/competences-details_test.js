import { find, click, currentURL, findAll, visit } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

describe("Acceptance | Competence details | Afficher la page de détails d'une compétence", function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();
  let user;
  let server;

  beforeEach(function () {
    server = this.server;
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function () {
    let scorecardWithPoints;
    let scorecardWithRemainingDaysBeforeReset;
    let scorecardWithoutPoints;
    let scorecardWithMaxLevel;
    let scorecardWithRemainingDaysBeforeImproving;
    let scorecardWithoutRemainingDaysBeforeImproving;

    beforeEach(async function () {
      await authenticateByEmail(user);
      scorecardWithPoints = user.scorecards.models[0];
      scorecardWithRemainingDaysBeforeReset = user.scorecards.models[1];
      scorecardWithoutPoints = user.scorecards.models[2];
      scorecardWithMaxLevel = user.scorecards.models[3];
      scorecardWithRemainingDaysBeforeImproving = user.scorecards.models[4];
      scorecardWithoutRemainingDaysBeforeImproving = user.scorecards.models[5];
    });

    it('should be able to visit URL of competence details page', async function () {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      expect(currentURL()).to.equal(`/competences/${scorecardWithPoints.competenceId}/details`);
    });

    it('should display the competence details', async function () {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      expect(find('.scorecard-details-content-left__area').textContent).to.contain(scorecardWithPoints.area.title);
      expect(find('.scorecard-details-content-left__area').getAttribute('class')).to.contain(
        `scorecard-details-content-left__area--${scorecardWithPoints.area.color}`
      );
      expect(find('.scorecard-details-content-left__name').textContent).to.contain(scorecardWithPoints.name);
      expect(find('.scorecard-details-content-left__description').textContent).to.contain(
        scorecardWithPoints.description
      );
    });

    it('should transition to /competences when the user clicks on return', async function () {
      // given
      await visit(`/competences/${scorecardWithPoints.description}/details`);

      // when
      await click('.pix-return-to');

      // then
      expect(currentURL()).to.equal('/competences');
    });

    context('when the scorecard has 0 points because it was not started yet', function () {
      it('should not display level or score', async function () {
        // given
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
        expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(
          0
        );
        expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      it('should not display reset button nor reset sentence', async function () {
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        expect(findAll('.scorecard-details__reset-button')).to.have.lengthOf(0);
        expect(findAll('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
      });
    });

    context('when the scorecard has points', function () {
      it('should display level and score', async function () {
        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        expect(find('.competence-card__level .score-value').textContent).to.equal(scorecardWithPoints.level.toString());
        expect(find('.scorecard-details-content-right-score-container__pix-earned .score-value').textContent).to.equal(
          scorecardWithPoints.earnedPix.toString()
        );
        expect(find('.scorecard-details-content-right__level-info').textContent).to.contain(
          `${8 - scorecardWithPoints.pixScoreAheadOfNextLevel} pix avant le niveau ${scorecardWithPoints.level + 1}`
        );
      });

      it('should not display pixScoreAheadOfNextLevel when next level is over the max level', async function () {
        // when
        await visit(`/competences/${scorecardWithMaxLevel.competenceId}/details`);

        // then
        expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      it('should display tutorials if any', async function () {
        // given
        const nbTutos = scorecardWithPoints.tutorials.models.length;

        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        expect(findAll('.tutorial-card')).to.have.lengthOf(nbTutos);
      });

      context('when it has remaining some days before reset', function () {
        it('should display remaining days before reset', async function () {
          // when
          await visit(`/competences/${scorecardWithRemainingDaysBeforeReset.competenceId}/details`);

          // then
          expect(find('.scorecard-details-content-right__reset-message').textContent).to.contain(
            `Remise à zéro disponible dans ${scorecardWithRemainingDaysBeforeReset.remainingDaysBeforeReset} jours`
          );
          expect(findAll('.scorecard-details__reset-button')).to.have.lengthOf(0);
        });
      });

      context('when it has no remaining days before reset', function () {
        it('should display reset button', async function () {
          // when
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // then
          expect(find('.scorecard-details__reset-button').textContent).to.contain('Remettre à zéro');
          expect(findAll('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
        });

        it('should display popup to validate reset', async function () {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // when
          await click('.scorecard-details__reset-button');

          // then
          expect(find('.scorecard-details-reset-modal__important-message').textContent).to.contain(
            `Votre niveau ${scorecardWithPoints.level} et vos ${scorecardWithPoints.earnedPix} Pix vont être supprimés de la compétence : ${scorecardWithPoints.name}.`
          );
        });

        it('should reset competence when user clicks on reset', async function () {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          await click('.scorecard-details__reset-button');
          // when
          await click('#pix-modal-footer__button-reset');

          // then
          expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(
            0
          );
          expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
        });

        it('should reset competence when user clicks on reset from results page', async function () {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);
          await click('.scorecard-details__reset-button');

          // when
          await click('#pix-modal-footer__button-reset');

          // then
          expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(
            0
          );
          expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
        });
      });

      context('when it has remaining some days before improving', function () {
        it('should display remaining days before improving', async function () {
          // when
          await visit(`/competences/${scorecardWithRemainingDaysBeforeImproving.competenceId}/details`);

          // then
          expect(find('.scorecard-details__improvement-countdown').textContent).to.contain(
            `${scorecardWithRemainingDaysBeforeImproving.remainingDaysBeforeImproving} jours`
          );
          expect(find('.scorecard-details__improve-button')).to.not.exist;
        });
      });

      context('when it has no remaining days before improving', function () {
        it('should display improving button', async function () {
          // when
          await visit(`/competences/${scorecardWithoutRemainingDaysBeforeImproving.competenceId}/details`);

          // then
          expect(findAll('.scorecard-details__improve-button')).to.exist;
        });
      });
    });
  });

  describe('Not authenticated cases', function () {
    it('should redirect to home, when user is not authenticated', async function () {
      // when
      await visit('/competences/1/details');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
