import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { click, find } from '@ember/test-helpers';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { invalidateSession } from 'ember-simple-auth/test-support';

const ASSESSMENT = 'ASSESSMENT';

describe('Acceptance | User dashboard page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function() {
    user = server.create('user', 'withEmail');
  });

  describe('Visit the user dashboard page', function() {

    it('is not possible when user is not connected', async function() {
      // when
      await visit('/accueil');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('is possible when user is connected', async function() {
      // given
      await authenticateByEmail(user);

      // when
      await visit('/accueil');

      // then
      expect(currentURL()).to.equal('/accueil');
    });
  });

  describe('campaign-participation-overviews', function() {
    describe('when user is doing a campaign of type assessment', function() {

      beforeEach(async function() {
        await authenticateByEmail(user);
      });

      afterEach(async function() {
        await invalidateSession();
      });

      context('when user has not completed the campaign', () => {
        let uncompletedCampaign;
        let uncompletedCampaignParticipationOverview;

        beforeEach(async function() {
          uncompletedCampaign = server.create('campaign', {
            idPixLabel: 'email',
            type: ASSESSMENT,
            isArchived: false,
            title: 'My Campaign',
            code: '123',
          }, 'withThreeChallenges');

          uncompletedCampaignParticipationOverview = server.create('campaign-participation-overview', {
            assessmentState: 'started',
            campaignCode: uncompletedCampaign.code,
            campaignTitle: uncompletedCampaign.title,
            createdAt: new Date('2020-04-20T04:05:06Z'),
            isShared: false,
          });
        });

        it('should display a card with a resume button', async function() {
        // when
          await visit('/accueil');
          // then
          const resumeButton = find('.campaign-participation-overview-card-content__action');
          expect(resumeButton).to.exist;
          expect(resumeButton.textContent.trim()).to.equal('Reprendre');
        });

        it('should redirect to the unfinished campaign where it stopped when clicking on resume button ', async function() {
        // when
          await visit('/accueil');
          await click('.campaign-participation-overview-card-content__action');

          // then
          expect(currentURL()).to.equal(`/campagnes/${uncompletedCampaignParticipationOverview.campaignCode}/presentation`);
        });
      });

      context('when user has completed the campaign but not shared his/her results', () => {
        let unsharedCampaign;
        let unsharedCampaignParticipationOverview;

        beforeEach(async function() {
          unsharedCampaign = server.create('campaign', {
            idPixLabel: 'email',
            type: ASSESSMENT,
            isArchived: false,
            code: '123',
          }, 'withThreeChallenges');

          unsharedCampaignParticipationOverview = server.create('campaign-participation-overview', {
            assessmentState: 'completed',
            campaignCode: unsharedCampaign.code,
            createdAt: new Date('2020-04-20T04:05:06Z'),
            isShared: false,
          });
        });

        it('should display a card with a share button', async function() {
        // when
          await visit('/accueil');

          // then
          const shareButton = find('.campaign-participation-overview-card-content__action');
          expect(shareButton).to.exist;
          expect(shareButton.textContent.trim()).to.equal('Envoyer mes résultats');
        });

        it('should redirect to the unshared campaign results page when clicking on share button', async function() {
        // when
          await visit('/accueil');
          await click('.campaign-participation-overview-card-content__action');

          // then
          expect(currentURL()).to.equal(`/campagnes/${unsharedCampaignParticipationOverview.campaignCode}/presentation`);
        });
      });
    });
  });

  describe('recommended-competences', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
      await visit('/accueil');
    });

    it('should display recommended-competences section', function() {
      expect(find('section[data-test-recommended-competences]')).to.exist;
    });

    it('should display the link to profile', function() {
      expect(find('.dashboard-content-section__button')).to.exist;
    });

  });

  describe('started-competences', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
      await visit('/accueil');
    });

    it('should display started-competences section', function() {
      expect(find('section[data-test-started-competences]')).to.exist;
    });

    it('should link to competence-details page on click on level circle', async function() {
      // when
      await click('.competence-card__link');

      // then
      const scorecard = user.scorecards.models[0];
      expect(currentURL()).to.equal(`/competences/${scorecard.competenceId}/details`);
    });
  });

  describe('new dashboard information', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
      await visit('/accueil');
    });

    it('should close new dashboard information on user click', async function() {
      // given
      expect(find('.new-information')).to.exist;

      // when
      await click('.new-information__close');

      // then
      expect(find('.new-information')).not.to.exist;
    });
  });
});
