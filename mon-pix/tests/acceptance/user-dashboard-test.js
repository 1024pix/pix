import { currentURL, click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
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

  describe('Visit the user dashboard page', function() {

    beforeEach(async function() {
      user = server.create('user', 'withEmail');
    });

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

    beforeEach(async function() {
      user = server.create('user', 'withEmail');
    });

    describe('when user is doing a campaign of type assessment', function() {

      context('when user has not completed the campaign', function() {
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
          await authenticateByEmail(user);
        });

        afterEach(async function() {
          await invalidateSession();
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

      context('when user has completed the campaign but not shared his/her results', function() {
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
          await authenticateByEmail(user);

        });

        afterEach(async function() {
          await invalidateSession();
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
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
      await visit('/accueil');
    });

    it('should display recommended-competences section', function() {
      expect(find('section[data-test-recommended-competences]')).to.exist;
    });

    it('should display the link to profile', function() {
      expect(find('.dashboard-content-main-section__button')).to.exist;
    });

  });

  describe('started-competences', function() {

    beforeEach(async function() {
      user = server.create('user', 'withEmail');
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

  describe('new-information', function() {

    afterEach(async function() {
      await invalidateSession();
    });

    describe('when user has new information to see', function() {

      beforeEach(async function() {
        user = server.create('user', 'withEmail');
      });

      describe('when user has closable information', function() {
        it('should close new dashboard information on user click', async function() {
          // given
          await authenticateByEmail(user);
          await visit('/accueil');
          expect(find('.new-information')).to.exist;

          // when
          await click('.new-information__close');

          // then
          expect(find('.new-information')).not.to.exist;
        });
      });

      describe('when user is doing a campaign of type collect profile', function() {

        let campaign, campaignParticipation;

        beforeEach(async function() {
          campaign = server.create('campaign', {
            isArchived: false,
            title: 'SomeTitle',
            type: 'PROFILES_COLLECTION',
            code: 'SNAP1234',
          });

          campaignParticipation = server.create('campaign-participation', {
            campaign,
            user,
            isShared: false,
            createdAt: new Date('2020-04-20T04:05:06Z'),
          });
          campaignParticipation.assessment.update({ state: 'completed' });
          user.update({ campaignParticipations: [campaignParticipation] });

          await authenticateByEmail(user);
        });

        describe('when user has not shared his results', () => {

          it('should display a resume campaign banner for the campaign', async function() {
            // when
            await visit('/accueil');

            // then
            expect(find('.new-information__content')).to.exist;
            expect(find('.new-information-content-text__button')).to.exist;
          });

          it('should display accessibility information in the banner', async function() {
            // when
            await visit('/accueil');

            // then
            const button = find('.new-information-content-text__button');
            const a11yText = button.firstChild.textContent;
            expect(button).to.exist;
            expect(a11yText).to.exist;
          });
        });

        describe('when users wants to share his results by clicking the resume button', function() {
          it('should redirect the user to the campaign results sharing page', async function() {
            // given
            await visit('/accueil');

            // when
            await click('.new-information-content-text__button');

            // then
            expect(currentURL()).to.equal('/campagnes/SNAP1234/collecte/envoi-profil');
          });
        });
      });
    });

    describe('when user has no new information to see', function() {

      it('should not render any new-information banner', async function() {
        // given
        user = server.create('user', 'withEmail', 'hasSeenNewDashboardInfo');
        console.log(user);

        // when
        await authenticateByEmail(user);

        // then
        expect(find('.new-information__content')).not.to.exist;
      });
    });
  });
});
