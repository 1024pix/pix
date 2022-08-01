import { find, click, currentURL, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module("Acceptance | Competence details | Afficher la page de détails d'une compétence", function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;
  let server;

  hooks.beforeEach(function () {
    server = this.server;
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    let scorecardWithPoints;
    let scorecardWithRemainingDaysBeforeReset;
    let scorecardWithoutPoints;
    let scorecardWithMaxLevel;
    let scorecardWithRemainingDaysBeforeImproving;
    let scorecardWithoutRemainingDaysBeforeImproving;

    hooks.beforeEach(async function () {
      await authenticateByEmail(user);
      scorecardWithPoints = user.scorecards.models[0];
      scorecardWithRemainingDaysBeforeReset = user.scorecards.models[1];
      scorecardWithoutPoints = user.scorecards.models[2];
      scorecardWithMaxLevel = user.scorecards.models[3];
      scorecardWithRemainingDaysBeforeImproving = user.scorecards.models[4];
      scorecardWithoutRemainingDaysBeforeImproving = user.scorecards.models[5];
    });

    test('should be able to visit URL of competence details page', async function (assert) {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      assert.equal(currentURL(), `/competences/${scorecardWithPoints.competenceId}/details`);
    });

    test('should display the competence details', async function (assert) {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      assert.dom(find('.scorecard-details-content-left__area').textContent).hasText(scorecardWithPoints.area.title);
      assert.dom(
        find('.scorecard-details-content-left__area').hasAttribute(
          'class',
          `scorecard-details-content-left__area--${scorecardWithPoints.area.color}`
        )
      );
      assert.dom(find('.scorecard-details-content-left__name').textContent).hasText(scorecardWithPoints.name);
      assert
        .dom(find('.scorecard-details-content-left__description').textContent)
        .hasText(scorecardWithPoints.description);
    });

    test('should transition to /competences when the user clicks on return', async function (assert) {
      // given
      await visit(`/competences/${scorecardWithPoints.description}/details`);

      // when
      await click('.pix-return-to');

      // then
      assert.equal(currentURL(), '/competences');
    });

    module('when the scorecard has 0 points because it was not started yet', function () {
      test('should not display level or score', async function (assert) {
        // given
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        assert.equal(findAll('.competence-card__level .score-value').length, 0);
        assert.equal(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value'), 0);
        assert.equal(findAll('.scorecard-details-content-right__level-info'), 0);
      });

      test('should not display reset button nor reset sentence', async function (assert) {
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        assert.equal(findAll('.scorecard-details__reset-button'), 0);
        assert.equal(findAll('.scorecard-details-content-right__reset-message'), 0);
      });
    });

    module('when the scorecard has points', function () {
      test('should display level and score', async function (assert) {
        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        assert.equal(find('.competence-card__level .score-value').textContent, scorecardWithPoints.level.toString());
        assert.equal(
          find('.scorecard-details-content-right-score-container__pix-earned .score-value').textContent,
          scorecardWithPoints.earnedPix.toString()
        );
        assert
          .dom(find('.scorecard-details-content-right__level-info').textContent)
          .hasText(
            `${8 - scorecardWithPoints.pixScoreAheadOfNextLevel} pix avant le niveau ${scorecardWithPoints.level + 1}`
          );
      });

      test('should not display pixScoreAheadOfNextLevel when next level is over the max level', async function (assert) {
        // when
        await visit(`/competences/${scorecardWithMaxLevel.competenceId}/details`);

        // then
        assert.equal(findAll('.scorecard-details-content-right__level-info').length, 0);
      });

      test('should display tutorials if any', async function (assert) {
        // given
        const nbTutos = scorecardWithPoints.tutorials.models.length;

        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        assert.equal(findAll('.tutorial-card-v2').length, nbTutos);
      });

      module('when it has remaining some days before reset', function () {
        test('should display remaining days before reset', async function (assert) {
          // when
          await visit(`/competences/${scorecardWithRemainingDaysBeforeReset.competenceId}/details`);

          // then
          assert
            .dom(find('.scorecard-details-content-right__reset-message').textContent)
            .to.contain(
              `Remise à zéro disponible dans ${scorecardWithRemainingDaysBeforeReset.remainingDaysBeforeReset} jours`
            );
          assert.equal(findAll('.scorecard-details__reset-button').length, 0);
        });
      });

      module('when it has no remaining days before reset', function () {
        test('should display reset button', async function (assert) {
          // when
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // then
          assert.dom(find('.scorecard-details__reset-button').textContent).hasText('Remettre à zéro');
          assert.equal(findAll('.scorecard-details-content-right__reset-message').length, 0);
        });

        test('should display popup to validate reset', async function (assert) {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // when
          await click('.scorecard-details__reset-button');

          // then
          assert
            .dom(find('.scorecard-details-reset-modal__important-message').textContent)
            .hasText(
              `Votre niveau ${scorecardWithPoints.level} et vos ${scorecardWithPoints.earnedPix} Pix vont être supprimés.`
            );
        });

        test('should reset competence when user clicks on reset', async function (assert) {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);
          await click('.scorecard-details__reset-button');

          // when
          await click('#pix-mdoal-footer__button-reset');

          // then
          assert.equal(findAll('.competence-card__level .score-value').length, 0);
          assert.equal(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value').length, 0);
          assert.equal(findAll('.scorecard-details-content-right__level-info').length, 0);
        });

        test('should reset competence when user clicks on reset from results page', async function (assert) {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);
          await click('.scorecard-details__reset-button');

          // when
          await click('#pix-mdoal-footer__button-reset');

          // then
          assert.equal(findAll('.competence-card__level .score-value').length, 0);
          assert.equal(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value').length, 0);
          assert.equal(findAll('.scorecard-details-content-right__level-info').length, 0);
        });
      });

      module('when it has remaining some days before improving', function () {
        test('should display remaining days before improving', async function (assert) {
          // when
          await visit(`/competences/${scorecardWithRemainingDaysBeforeImproving.competenceId}/details`);

          // then
          assert
            .dom(find('.scorecard-details__improvement-countdown').textContent)
            .hasText(`${scorecardWithRemainingDaysBeforeImproving.remainingDaysBeforeImproving} jours`);
          assert.dom(find('.scorecard-details__improve-button')).doesNotExist();
        });
      });

      module('when it has no remaining days before improving', function () {
        test('should display improving button', async function (assert) {
          // when
          await visit(`/competences/${scorecardWithoutRemainingDaysBeforeImproving.competenceId}/details`);

          // then
          assert.dom(findAll('.scorecard-details__improve-button')).exists();
        });
      });
    });
  });

  module('Not authenticated cases', function () {
    test('should redirect to home, when user is not authenticated', async function (assert) {
      // when
      await visit('/competences/1/details');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });
});
