import { find, click, currentURL, findAll } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Competence details | Afficher la page de détails d\'une compétence', () => {
  setupApplicationTest();
  setupMirage();
  let user;
  let server;

  beforeEach(function() {
    server = this.server;
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', () => {
    let scorecardWithPoints;
    let scorecardWithRemainingDaysBeforeReset;
    let scorecardWithoutPoints;
    let scorecardWithMaxLevel;

    beforeEach(async () => {
      await authenticateByEmail(user);
      scorecardWithPoints = user.scorecards.models[0];
      scorecardWithRemainingDaysBeforeReset = user.scorecards.models[1];
      scorecardWithoutPoints = user.scorecards.models[2];
      scorecardWithMaxLevel = user.scorecards.models[3];
    });

    it('should be able to visit URL of competence details page', async () => {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      expect(currentURL()).to.equal(`/competences/${scorecardWithPoints.competenceId}/details`);
    });

    it('should display the competence details', async () => {
      // when
      await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

      // then
      expect(find('.scorecard-details-content-left__area').textContent).to.contain(scorecardWithPoints.area.title);
      expect(find('.scorecard-details-content-left__area').getAttribute('class')).to.contain(`scorecard-details-content-left__area--${scorecardWithPoints.area.color}`);
      expect(find('.scorecard-details-content-left__name').textContent).to.contain(scorecardWithPoints.name);
      expect(find('.scorecard-details-content-left__description').textContent).to.contain(scorecardWithPoints.description);
    });

    it('should transition to /profil when the user clicks on return', async () => {
      // given
      await visit(`/competences/${scorecardWithPoints.description}/details`);

      // when
      await click('.link__return-to');

      // then
      expect(currentURL()).to.equal('/profil');
    });

    context('when the scorecard has 0 points because it was not started yet', () => {

      it('should not display level or score', async () => {
        // given
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
        expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(0);
        expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      it('should not display reset button nor reset sentence', async () => {
        // when
        await visit(`/competences/${scorecardWithoutPoints.competenceId}/details`);

        // then
        expect(findAll('.scorecard-details__reset-button')).to.have.lengthOf(0);
        expect(findAll('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
      });
    });

    context('when the scorecard has points', () => {

      it('should display level and score', async () => {
        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        expect(find('.competence-card__level .score-value').textContent).to.equal(scorecardWithPoints.level.toString());
        expect(find('.scorecard-details-content-right-score-container__pix-earned .score-value').textContent).to.equal(scorecardWithPoints.earnedPix.toString());
        expect(find('.scorecard-details-content-right__level-info').textContent).to.contain(`${8 - scorecardWithPoints.pixScoreAheadOfNextLevel} pix avant le niveau ${scorecardWithPoints.level + 1}`);
      });

      it('should not display pixScoreAheadOfNextLevel when next level is over the max level', async () => {
        // when
        await visit(`/competence/${scorecardWithMaxLevel.competenceId}/details`);

        // then
        expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      it('should display tutorials if any', async () => {
        // given
        const nbTutos = scorecardWithPoints.tutorials.models.length;

        // when
        await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

        // then
        expect(findAll('.tutorial-item')).to.have.lengthOf(nbTutos);
      });

      context('when it is remaining some days before reset', () => {

        it('should display remaining days before reset', async () => {
          // when
          await visit(`/competences/${scorecardWithRemainingDaysBeforeReset.competenceId}/details`);

          // then
          expect(find('.scorecard-details-content-right__reset-message').textContent).to.contain(`Remise à zéro disponible dans ${scorecardWithRemainingDaysBeforeReset.remainingDaysBeforeReset} jours`);
          expect(findAll('.scorecard-details__reset-button')).to.have.lengthOf(0);
        });
      });

      context('when it has no remaining days before reset', () => {

        it('should display reset button', async () => {
          // when
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // then
          expect(find('.scorecard-details__reset-button').textContent).to.contain('Remettre à zéro');
          expect(findAll('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
        });

        it('should display popup to validate reset', async () => {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);

          // when
          await click('.scorecard-details__reset-button');

          // then
          expect(find('.scorecard-details-reset-modal__important-message').textContent).to.contain(`Votre niveau ${scorecardWithPoints.level} et vos ${scorecardWithPoints.earnedPix} Pix vont être supprimés.`);
        });

        it('should reset competence when user clicks on reset', async () => {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);
          await click('.scorecard-details__reset-button');

          // when
          await click('.button--red');

          // then
          expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
        });

        it('should reset competence when user clicks on reset from results page', async () => {
          // given
          await visit(`/competences/${scorecardWithPoints.competenceId}/details`);
          await click('.scorecard-details__reset-button');

          // when
          await click('.button--red');

          // then
          expect(findAll('.competence-card__level .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(0);
          expect(findAll('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
        });

      });
    });

  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visit('/competences/1/details');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
