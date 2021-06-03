import { findAll, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import visit from '../helpers/visit';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { setupApplicationTest } from 'ember-mocha';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Campaigns | Campaigns Result', function() {

  setupApplicationTest();
  setupMirage();
  setupIntl();

  let user;
  let campaign;
  let campaignParticipation;
  let campaignParticipationResult;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { isArchived: false });
    campaignParticipation = server.create('campaign-participation', { campaign });
  });

  describe('Display campaign results', function() {

    describe('When user is not logged in', function() {

      beforeEach(async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
      });

      it('should be redirect to connexion page', async function() {
        // then
        expect(currentURL()).to.equal('/connexion');
      });

    });

    describe('When user is logged in', async function() {

      const competenceResultName = 'Competence Nom';
      const partnerCompetenceResultName = 'badge partner competence nom';

      beforeEach(async function() {
        // given
        await authenticateByEmail(user);
        const competenceResult = server.create('competence-result', {
          name: competenceResultName,
          masteryPercentage: 85,
        });
        campaignParticipationResult = server.create('campaign-participation-result', { id: campaignParticipation.id, competenceResults: [competenceResult], masteryPercentage: 85 });
      });

      it('should access to the page', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/resultats`);
      });

      it('should display results', async function() {
        // given
        const COMPETENCE_MASTERY_PERCENTAGE = '85%';

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(contains(competenceResultName)).to.exist;
        expect(contains(COMPETENCE_MASTERY_PERCENTAGE)).to.exist;
      });

      it('should display different competences results when the badge key is PIX_EMPLOI_CLEA', async function() {
        // given
        const BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE = '80%';

        const partnerCompetenceResult = server.create('partner-competence-result', {
          name: partnerCompetenceResultName,
          totalSkillsCount: 5,
          validatedSkillsCount: 4,
          masteryPercentage: 80,
        });

        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          key: 'PIX_EMPLOI_CLEA',
          isAcquired: false,
          partnerCompetenceResults: [partnerCompetenceResult],
        });

        campaignParticipationResult.update({
          campaignParticipationBadges: [badge],
        });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(contains(partnerCompetenceResultName)).to.exist;
        expect(contains(BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE)).to.exist;
      });

      it('should display the Pix emploi badge when badge is acquired', async function() {
        // given
        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          isAcquired: true,
        });
        campaignParticipationResult.update({ campaignParticipationBadges: [badge] });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(contains('Congrats, you won a Pix Emploi badge')).to.exist;
      });

      it('should not display the Pix emploi badge when badge is not acquired', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(contains(this.intl.t('pages.skill-review.badges-title'))).to.not.exist;
      });

      it('should display only one badge when badge is acquired', async function() {
        // given
        const acquiredBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Yellow badge',
          imageUrl: '/images/badges/yellow.svg',
          message: 'Congrats, you won a Yellow badge',
          isAcquired: true,
        });
        const unacquiredBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a green badge',
          imageUrl: '/images/badges/green.svg',
          message: 'Congrats, you won a Green badge',
          isAcquired: false,
        });
        campaignParticipationResult.update({ campaignParticipationBadges: [acquiredBadge, unacquiredBadge] });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        expect(findAll('.badge-acquired-card').length).to.equal(1);
      });

      describe('when campaign has stages', async function() {

        it('should display reached stage', async function() {
          // given
          const reachedStage = server.create('reached-stage', {
            title: 'You reached Stage 1',
            message: 'You are almost a rock star',
            threshold: 50,
            starCount: 2,
          });
          campaignParticipationResult.update({ reachedStage });
          campaignParticipationResult.update({ stageCount: 5 });

          // when
          await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          expect(contains('You reached Stage 1')).to.exist;
        });

        it('should not display reached stage when CLEA badge acquired', async function() {
          // given
          const reachedStage = server.create('reached-stage', {
            title: 'You reached Stage 1',
            message: 'You are almost a rock star',
            threshold: 90,
            starCount: 2,
          });

          const cleaBadge = server.create('campaign-participation-badge', {
            altMessage: 'Vous avez validé le badge Pix Emploi.',
            imageUrl: 'url.svg',
            isAcquired: true,
            message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
            title: 'Pix Emploi - Clea',
            id: '100',
            key: 'PIX_EMPLOI_CLEA',
          });

          campaignParticipationResult.campaignParticipationBadges = [cleaBadge];
          campaignParticipationResult.update({ reachedStage });

          // when
          await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          expect(contains('You reached Stage 1')).to.not.exist;
          expect(contains(cleaBadge.message)).to.exist;
        });
      });

      it('should share the results', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // then
        expect(contains(this.intl.t('pages.skill-review.already-shared'))).to.exist;
        expect(contains(this.intl.t('pages.skill-review.actions.continue'))).to.exist;
        expect(contains(this.intl.t('pages.skill-review.send-results'))).to.be.null;
        expect(contains(this.intl.t('pages.skill-review.actions.improve'))).to.be.null;
      });

      it('should redirect to default page on click', async function() {
        // given
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

        // then
        expect(currentURL()).to.equal('/accueil');
      });
    });
  });

  context('when campaign is for Novice and isSimplifiedAccess', async function() {
    let campaignForNovice;

    beforeEach(function() {
      campaignForNovice = server.create('campaign', { isForAbsoluteNovice: true, isSimplifiedAccess: true });
      campaignParticipation = server.create('campaign-participation', { campaign: campaignForNovice });
    });

    it('should redirect to default page on click when user is connected', async function() {
      // given
      await authenticateByEmail(user);
      await visit(`/campagnes/${campaignForNovice.code}`);
      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      expect(currentURL()).to.equal('/accueil');
    });

    it('should redirect to sign up page on click when user is anonymous', async function() {
      // given
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });

      await visit(`/campagnes/${campaignForNovice.code}`);
      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      expect(currentURL()).to.equal('/inscription');
    });

  });
});
