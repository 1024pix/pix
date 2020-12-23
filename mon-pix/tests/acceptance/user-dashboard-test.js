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
const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

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

  describe('when user is doing a campaign of type assessment', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    afterEach(async function() {
      await invalidateSession();
    });

    context('when user has not completed the campaign', () => {
      let uncompletedCampaign;
      let uncompletedCampaignParticipation;

      beforeEach(async function() {
        uncompletedCampaign = server.create('campaign', {
          idPixLabel: 'email',
          type: ASSESSMENT,
          isArchived: false,
        }, 'withThreeChallenges');

        uncompletedCampaignParticipation = server.create('campaign-participation', {
          campaign: uncompletedCampaign,
          user,
          createdAt: new Date('2020-04-20T04:05:06Z'),
          isShared: false,
        });
        uncompletedCampaignParticipation.assessment.update({ state: 'started' });
      });

      it('should display a card with a resume button', async function() {
        // when
        await visit('/accueil');

        // then
        const resumeButton = find('.campaign-participation-card__action');
        expect(resumeButton).to.exist;
        expect(resumeButton.textContent.trim()).to.equal('Reprendre');
      });

      it('should redirect to the unfinished campaign where it stopped when clicking on resume button ', async function() {
        // when
        await visit('/accueil');
        await click('.campaign-participation-card__action');

        // then
        expect(currentURL()).to.equal(`/campagnes/${uncompletedCampaign.code}/evaluation/didacticiel`);
      });
    });

    context('when user has completed the campaign but not shared his/her results', () => {
      let unsharedCampaign;
      let unsharedCampaignParticipation;

      beforeEach(async function() {
        unsharedCampaign = server.create('campaign', {
          idPixLabel: 'email',
          type: ASSESSMENT,
          isArchived: false,
        }, 'withThreeChallenges');

        unsharedCampaignParticipation = server.create('campaign-participation', {
          campaign: unsharedCampaign,
          user,
          createdAt: new Date('2020-04-20T04:05:06Z'),
          isShared: false,
        });

        unsharedCampaignParticipation.assessment.update({ state: 'completed' });

        const campaignParticipationResult = server.create('campaign-participation-result', {});
        unsharedCampaignParticipation.update({ campaignParticipationResult });
      });

      it('should display a card with a share button', async function() {
        // when
        await visit('/accueil');

        // then
        const shareButton = find('.campaign-participation-card__action');
        expect(shareButton).to.exist;
        expect(shareButton.textContent.trim()).to.equal('Envoyer mes résultats');
      });

      it('should redirect to the unshared campaign results page when clicking on share button', async function() {
        // given
        const currentAssessment = server.schema.campaignParticipations.findBy({ campaignId: unsharedCampaign.id }).assessment;

        // when
        await visit('/accueil');
        await click('.campaign-participation-card__action');

        // then
        expect(currentURL()).to.equal(`/campagnes/${unsharedCampaign.code}/evaluation/resultats/${currentAssessment.id}`);
      });
    });

    context('when user has completed the campaign and shared his/her results', () => {
      beforeEach(async function() {
        const sharedCampaign = server.create('campaign', { isArchived: false, type: 'ASSESSMENT' });
        const sharedCampaignParticipation = server.create('campaign-participation', {
          campaign: sharedCampaign,
          user,
          createdAt: new Date('2020-04-20T04:05:06Z'),
          isShared: true,
        });
        sharedCampaignParticipation.assessment.update({ state: 'completed' });
      });

      it('should not display a card', async function() {
        // when
        await visit('/accueil');

        // then
        expect(find('.campaign-participation-card')).to.not.exist;
      });
    });
  });

  describe('when user is doing a campaign of type collect profile', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
      const collectProfileCampaign = server.create('campaign', {
        idPixLabel: 'email',
        isArchived: false,
        type: PROFILES_COLLECTION,
      }, 'withThreeChallenges');
      server.create('campaign-participation', {
        campaign: collectProfileCampaign,
        user,
        createdAt: new Date('2020-04-20T04:05:06Z'),
        isShared: false,
      });
    });

    it('should not display a card', async function() {
      // when
      await visit('/accueil');

      // then
      expect(find('.campaign-participation-card')).to.not.exist;
    });
  });
});
