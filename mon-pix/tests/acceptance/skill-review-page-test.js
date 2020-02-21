import { click, find, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentification';
import {
  completeCampaignAndSeeResultsByCode,
  resumeCampaignByCode
} from '../helpers/campaign';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Campaigns | Campaigns Result', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Display campaign results', function() {

    describe('When user is not logged in', function() {

      beforeEach(async function() {
        // when
        await visitWithAbortedTransition('/campagnes/1/resultats/1');
      });

      it('should be redirect to connexion page', async function() {
        // then
        expect(currentURL()).to.equal('/connexion');
      });

    });

    describe('When user is logged in', async function() {

      const requestedAssessmentId = 'ref_assessment_id';
      const campaignId = 1;

      beforeEach(async function() {
        await authenticateByEmail(user);
        await visitWithAbortedTransition(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
      });

      it('should access to the page', async function() {
        // then
        expect(currentURL()).to.equal(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
      });

      it('should display results', async function() {
        // when
        await resumeCampaignByCode('AZERTY2');
        await completeCampaignAndSeeResultsByCode('AZERTY2');

        // then
        expect(find('table tbody tr td:nth-child(1) span:nth-child(2)').textContent).to.equal('Compétence 1.1');
        expect(find('table tbody tr td:nth-child(2) .progression-gauge').getAttribute('style')).to.equal('width: 100%');
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__marker').getAttribute('style')).to.equal('width: 30%');
        expect(find('table tbody tr td:nth-child(2) .progression-gauge__tooltip').textContent).to.include('30%');
      });

      it('should share the results', async function() {
        // when
        await resumeCampaignByCode('AZERTY2');
        await completeCampaignAndSeeResultsByCode('AZERTY2');
        await click('.skill-review-share__button');

        // then
        expect(find('.skill-review-share__thanks')).to.exist;
        expect(find('.skill-review-share__back-to-home')).to.exist;
        expect(find('.skill-review-share__legal')).to.be.null;
        expect(find('.skill-review__improvement-button')).to.be.null;
      });

      it('should not display the archivation block if the campaign has not been archived', async () => {
        // when
        await resumeCampaignByCode('AZERTY2');
        await completeCampaignAndSeeResultsByCode('AZERTY2');

        // then
        expect(find('.skill-review__campaign-archived')).not.to.exist;
      });

      it('should redirect to home/profil page on click', async function() {
        // given
        await resumeCampaignByCode('AZERTY2');
        await completeCampaignAndSeeResultsByCode('AZERTY2');
        await click('.skill-review-share__button');

        // when
        await click('.skill-review-share__back-to-home');

        // then
        expect(currentURL()).to.equal('/profil');
      });
    });
  });
});
