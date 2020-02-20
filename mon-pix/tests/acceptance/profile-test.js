import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Profile', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    it('can visit /profil', async function() {
      // when
      await visitWithAbortedTransition('/profil');

      // then
      expect(currentURL()).to.equal('/profil');
    });

    it('should display pixscore', async function() {
      await visitWithAbortedTransition('/profil');

      // then
      expect(find('.hexagon-score-content__pix-score').textContent).to.contains(user.pixScore.value);
    });

    it('should display scorecards classified accordingly to each area', async function() {
      // when
      await visitWithAbortedTransition('/profil');

      // then
      user.scorecards.models.forEach((scorecard) => {
        const splitIndex = scorecard.index.split('.');
        const competenceNumber = splitIndex[splitIndex.length - 1];
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__area-name`
        ).textContent).to.equal(scorecard.area.title);
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__competence-name`
        ).textContent).to.equal(scorecard.name);
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .score-value`
        ).textContent).to.equal(scorecard.level > 0 ? scorecard.level.toString() : scorecard.status === 'NOT_STARTED' ? '' : '–');
      });
    });

    it('should link to competence-details page on click on level circle', async function() {
      // given
      await visitWithAbortedTransition('/profil');

      // when
      await click('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__link');

      // then
      const scorecard = user.scorecards.models[0];
      expect(currentURL()).to.equal(`/competences/${scorecard.competenceId}/details`);
    });

    context('when user has not completed the campaign', () => {

      it('should display a resume campaign banner for a campaign with no title', async function() {
        // given
        this.server.create('assessment', {
          id: 2,
          type: 'SMART_PLACEMENT',
          state: 'started',
        });
        this.server.create('campaign-participation', {
          id: 1,
          isShared: false,
          campaignId: 1,
          assessmentId: 2,
          userId: user.id,
          createdAt: '2019-09-30T14:30:00Z',
        });

        // when
        await visitWithAbortedTransition('/');

        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
        expect(find('.resume-campaign-banner__container').textContent).to.contain('Vous n\'avez pas terminé votre parcours');
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Reprendre');
      });

      it('should display a resume campaign banner for a campaign with a campaign with a title', async function() {
        // given
        this.server.create('assessment', {
          id: 2,
          type: 'SMART_PLACEMENT',
          state: 'started',
        });
        this.server.create('campaign-participation', {
          id: 1,
          isShared: false,
          campaignId: 3,
          assessmentId: 2,
          userId: user.id,
          createdAt: '2019-09-30T14:30:00Z',
        });

        // when
        await visitWithAbortedTransition('/');

        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
        expect(find('.resume-campaign-banner__container').textContent).to.contain('Vous n\'avez pas terminé le parcours "Le Titre de la campagne"');
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Reprendre');
      });
    });

    context('when user has completed the campaign but not shared', () => {

      it('should display a resume campaign banner for a campaign with no title', async function() {
        // given
        this.server.create('assessment', {
          id: 2,
          type: 'SMART_PLACEMENT',
          state: 'completed',
        });
        this.server.create('campaign-participation', {
          id: 1,
          isShared: false,
          campaignId: 1,
          assessmentId: 2,
          userId: user.id,
          createdAt: '2019-09-30T14:30:00Z',
        });

        // when
        await visitWithAbortedTransition('/');

        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
        expect(find('.resume-campaign-banner__container').textContent).to.contain('Parcours terminé ! Envoyez vos résultats.');
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
      });

      it('should display a resume campaign banner for a campaign with a campaign with a title', async function() {
        // given
        this.server.create('assessment', {
          id: 2,
          type: 'SMART_PLACEMENT',
          state: 'completed',
        });
        this.server.create('campaign-participation', {
          id: 1,
          isShared: false,
          campaignId: 3,
          assessmentId: 2,
          userId: user.id,
          createdAt: '2019-09-30T14:30:00Z',
        });

        // when
        await visitWithAbortedTransition('/');

        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
        expect(find('.resume-campaign-banner__container').textContent).to.contain('Parcours "Le Titre de la campagne" terminé ! Envoyez vos résultats.');
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
      });
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visitWithAbortedTransition('/profil');
      expect(currentURL()).to.equal('/connexion');
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visitWithAbortedTransition('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
