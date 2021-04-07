import { click, find, findAll, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail, authenticateByGAR } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Campaigns | Campaigns Result', function() {

  setupApplicationTest();
  setupMirage();

  let user;
  let campaign;
  let campaignParticipation;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { isArchived: false });
    campaignParticipation = server.create('campaign-participation', { campaign });
  });

  describe('Display campaign results', function() {

    describe('When user is not logged in', function() {

      beforeEach(async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);
      });

      it('should be redirect to connexion page', async function() {
        // then
        expect(currentURL()).to.equal('/connexion');
      });

    });

    describe('When user is logged in', async function() {

      const competenceResultName = 'Competence Nom';
      const partnerCompetenceResultName = 'badge partner competence nom';

      let campaignParticipationResult;

      beforeEach(async function() {
        // given
        await authenticateByEmail(user);
        const totalSkillsCount = 10;
        const testedSkillsCount = 10;
        const validatedSkillsCount = 9;
        const masteryPercentage = 85;
        const competenceResult = server.create('competence-result', {
          name: competenceResultName,
          totalSkillsCount, testedSkillsCount, validatedSkillsCount, masteryPercentage });
        campaignParticipationResult = server.create('campaign-participation-result', {
          masteryPercentage,
          totalSkillsCount,
          testedSkillsCount,
          validatedSkillsCount,
          competenceResults: [competenceResult],
          campaignParticipationBadges: [],
        });
        campaignParticipation.update({ campaignParticipationResult });
      });

      it('should access to the page', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);
      });

      it('should display results', async function() {
        // given
        const COMPETENCE_MASTERY_PERCENTAGE = '85%';

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('table tbody tr th span:nth-child(2)').textContent).to.equal(competenceResultName);
        expect(find('.progress-gauge__tooltip').textContent).to.include(COMPETENCE_MASTERY_PERCENTAGE);
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
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('table tbody tr th span:nth-child(2)').textContent).to.equal(partnerCompetenceResultName);
        expect(find('.progress-gauge__tooltip').textContent).to.include(BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE);
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
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('.badge-acquired-card')).to.exist;
        expect(find('.skill-review-result__badge-subtitle')).to.exist;
      });

      it('should not display the Pix emploi badge when badge is not acquired', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('.skill-review-result__badge')).to.not.exist;
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
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

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
          await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

          // then
          expect(find('.reached-stage')).to.exist;
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
          await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

          // then
          expect(find('.reached-stage')).to.not.exist;
          expect(find('.skill-review-result__badge-subtitle')).to.not.exist;
          expect(find('.badge-acquired-card')).to.exist;
        });
      });

      it('should not display reached stage when campaign has no stages', async function() {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('.reached-stage')).to.not.exist;
      });

      it('should share the results', async function() {
        // when
        await visit(`/campagnes/${campaign.code}`);
        await click('.campaign-tutorial__ignore-button');
        await click('.checkpoint__continue-button');
        await click('.skill-review-share__button');

        // then
        expect(find('.skill-review-share__thanks')).to.exist;
        expect(find('.skill-review-share__back-to-home')).to.exist;
        expect(find('.skill-review-share__legal')).to.be.null;
        expect(find('.skill-review__improvement-button')).to.be.null;
      });

      it('should not display the archivation block if the campaign has not been archived', async () => {
        // when
        await visit(`/campagnes/${campaign.code}`);
        await click('.campaign-tutorial__ignore-button');
        await click('.checkpoint__continue-button');

        // then
        expect(find('.skill-review__campaign-archived')).not.to.exist;
      });

      it('should redirect to default page on click', async function() {
        // given
        await visit(`/campagnes/${campaign.code}`);
        await click('.campaign-tutorial__ignore-button');
        await click('.checkpoint__continue-button');
        await click('.skill-review-share__button');

        // when
        await click('.skill-review-share__back-to-home');

        // then
        expect(currentURL()).to.equal('/accueil');
      });
    });
  });

  context('when campaign is for Novice and isSimplifiedAccess', async function() {
    let campaignForNovice, anonymousUser;

    beforeEach(function() {
      campaignForNovice = server.create('campaign', { isForAbsoluteNovice: true, isSimplifiedAccess: true });
      campaignParticipation = server.create('campaign-participation', { campaign });
      anonymousUser = server.create('user', 'withEmail', {
        isAnonymous: true,
      });
    });

    it('should redirect to default page on click when user is connected', async function() {
      // given
      await authenticateByEmail(user);
      await visit(`/campagnes/${campaignForNovice.code}`);
      await click('.checkpoint__continue-button');
      await click('a[data-link-to-continue-pix]');

      // then
      expect(currentURL()).to.equal('/accueil');
    });

    it('should redirect to sign up page on click when user is not connected', async function() {
      // given
      await authenticateByGAR(anonymousUser);

      await visit(`/campagnes/${campaignForNovice.code}`);
      await click('.checkpoint__continue-button');
      await click('a[data-link-to-continue-pix]');

      // then
      expect(currentURL()).to.equal('/inscription');
    });

  });
});
