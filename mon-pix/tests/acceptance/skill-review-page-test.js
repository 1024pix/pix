import { click, find, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Campaigns | Campaigns Result', function() {
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
          partnerCompetenceResults: []
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
        const PROGRESSION_MAX_WIDTH = '100%';

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('table tbody tr td:nth-child(1) span:nth-child(2)').textContent).to.equal(competenceResultName);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge').getAttribute('style')).to.equal('width: ' + PROGRESSION_MAX_WIDTH);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__marker').getAttribute('style')).to.equal('width: ' + COMPETENCE_MASTERY_PERCENTAGE);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__tooltip').textContent).to.include(COMPETENCE_MASTERY_PERCENTAGE);
      });

      it('should display different competences results when there is partnerCompetenceResults', async function() {
        // given
        const BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE = '80%';
        const PROGRESSION_MAX_WIDTH = '100%';
        const partnerCompetenceResult = server.create('partner-competence-result', {
          name: partnerCompetenceResultName,
          totalSkillsCount: 5,
          validatedSkillsCount: 4,
          masteryPercentage: 80
        });
        campaignParticipationResult.update({
          partnerCompetenceResults: [partnerCompetenceResult]
        });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('table tbody tr td:nth-child(1) span:nth-child(2)').textContent).to.equal(partnerCompetenceResultName);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge').getAttribute('style')).to.equal('width: ' + PROGRESSION_MAX_WIDTH);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__marker').getAttribute('style')).to.equal('width: ' + BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE);
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__tooltip').textContent).to.include(BADGE_PARTNER_COMPETENCE_MASTERY_PERCENTAGE);
      });

      it('should display the Pix emploi badge badged campaign when badge criteria are fulfilled', async function() {
        // given
        const badge = server.create('badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
        });
        campaignParticipationResult.update({ badge, areBadgeCriteriaFulfilled: true });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('.skill-review-result__badge')).to.exist;
      });

      it('should not display the Pix emploi badge badged campaign when badge criteria are not fulfilled', async function() {
        // given
        const badge = server.create('badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
        });
        campaignParticipationResult.update({ badge, areBadgeCriteriaFulfilled: false });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats/${campaignParticipation.assessment.id}`);

        // then
        expect(find('.skill-review-result__badge')).to.not.exist;
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

      it('should redirect to home/profil page on click', async function() {
        // given
        await visit(`/campagnes/${campaign.code}`);
        await click('.campaign-tutorial__ignore-button');
        await click('.checkpoint__continue-button');
        await click('.skill-review-share__button');

        // when
        await click('.skill-review-share__back-to-home');

        // then
        expect(currentURL()).to.equal('/profil');
      });
    });
  });
});
