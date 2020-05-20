import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Profile', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    it('can visit /profil', async function() {
      // when
      await visit('/profil');

      // then
      expect(currentURL()).to.equal('/profil');
    });

    it('should display pixscore', async function() {
      await visit('/profil');

      // then
      expect(find('.hexagon-score-content__pix-score').textContent).to.contains(user.pixScore.value);
    });

    it('should display scorecards classified accordingly to each area', async function() {
      // when
      await visit('/profil');

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
      await visit('/profil');

      // when
      await click('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__link');

      // then
      const scorecard = user.scorecards.models[0];
      expect(currentURL()).to.equal(`/competences/${scorecard.competenceId}/details`);
    });

    context('when user is doing a campaign of type assessment', function() {
      context('when user has not completed the campaign', () => {

        it('should display a resume campaign banner for a campaign with no title', async function() {
          // given
          const campaign = server.create('campaign', { isArchived: false, type: 'ASSESSMENT' });
          server.create('campaign-participation',
            { campaign, user, isShared: false , createdAt: new Date('2020-04-20T04:05:06Z') });

          // when
          await visit('/');

          // then
          expect(find('.resume-campaign-banner__container').textContent).to.contain('Vous n\'avez pas terminé votre parcours');
          expect(find('.resume-campaign-banner__button').textContent).to.equal('Reprendre');
        });

        it('should display a resume campaign banner for a campaign with a campaign with a title', async function() {
          // given
          const campaign = server.create('campaign', { isArchived: false, title: 'SomeTitle', type: 'ASSESSMENT' });
          server.create('campaign-participation',
            { campaign, user, isShared: false , createdAt: new Date('2020-04-20T04:05:06Z') });

          // when
          await visit('/');

          // then
          expect(find('.resume-campaign-banner__container').textContent).to.contain(`Vous n'avez pas terminé le parcours "${campaign.title}"`);
          expect(find('.resume-campaign-banner__button').textContent).to.equal('Reprendre');
        });
      });

      context('when user has completed the campaign but not shared', () => {

        it('should display a resume campaign banner for a campaign with no title', async function() {
          // given
          const campaign = server.create('campaign', { isArchived: false, type: 'ASSESSMENT' });
          const campaignParticipation = server.create('campaign-participation',
            { campaign, user, isShared: false , createdAt: new Date('2020-04-20T04:05:06Z') });
          campaignParticipation.assessment.update({ state: 'completed' });

          // when
          await visit('/');

          // then
          expect(find('.resume-campaign-banner__container').textContent).to.contain('N\'oubliez pas de finaliser votre envoi !');
          expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
        });

        it('should display a resume campaign banner for a campaign with a campaign with a title', async function() {
          // given
          const campaign = server.create('campaign', { isArchived: false, title: 'SomeTitle', type: 'ASSESSMENT' });
          const campaignParticipation = server.create('campaign-participation',
            { campaign, user, isShared: false , createdAt: new Date('2020-04-20T04:05:06Z') });
          campaignParticipation.assessment.update({ state: 'completed' });

          // when
          await visit('/');

          // then
          expect(find('.resume-campaign-banner__container').textContent).to.contain(`Parcours "${campaign.title}" terminé. N'oubliez pas de finaliser votre envoi !`);
          expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
        });
      });
    });

    context('when user is doing a campaign of type collect profile', function() {
      context('when user has not shared the collect profile campaign', () => {
        it('should display a resume campaign banner for the campaign', async function() {
          // given
          const campaign = server.create('campaign', { isArchived: false, title: 'SomeTitle', type: 'PROFILES_COLLECTION' });
          const campaignParticipation = server.create('campaign-participation',
            { campaign, user, isShared: false , createdAt: new Date('2020-04-20T04:05:06Z') });
          campaignParticipation.assessment.update({ state: 'completed' });

          // when
          await visit('/');

          // then
          expect(find('.resume-campaign-banner__container').textContent).to.contain('N\'oubliez pas de finaliser votre envoi !');
          expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
        });
      });
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/profil');
      expect(currentURL()).to.equal('/connexion');
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visit('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
