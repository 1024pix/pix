import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser, completeCampaignAndSeeResultsByCode, resumeCampaignByCode } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Campaigns | Campaigns Result', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Display campaign results', function() {

    describe('When user is not logged in', function() {

      beforeEach(async function() {
        // when
        await visit('/campagnes/1/resultats/1');
      });

      it('should be redirect to connexion page', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/connexion');
        });
      });

    });

    describe('When user is logged in', async function() {

      const requestedAssessmentId = 'ref_assessment_id';
      const campaignId = 1;

      beforeEach(async function() {
        await authenticateAsSimpleUser();
        await visit(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
      });

      it('should access to the page', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.equal(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
        });
      });

      describe('When results are not shared yet', async function() {

        beforeEach(async function() {
          await resumeCampaignByCode('AZERTY2');
          await completeCampaignAndSeeResultsByCode('AZERTY2');
        });

        it('should display results', async function() {
          // then
          expect(find('table tbody tr td:nth-child(1) span:nth-child(2)').text()).to.equal('Compétence 1.1');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge').attr('style')).to.equal('width: 100%');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge__marker').attr('style')).to.equal('width: 30%');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge__tooltip').text()).to.include('30%');
        });
      });

      describe('When results are shared', async function() {

        beforeEach(async function() {
          await resumeCampaignByCode('AZERTY2');
          await completeCampaignAndSeeResultsByCode('AZERTY2');
          await click('.skill-review__share__button');
        });

        it('should display results', async function() {
          // then
          expect(find('table tbody tr td:nth-child(1) span:nth-child(2)').text()).to.equal('Compétence 1.1');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge').attr('style')).to.equal('width: 100%');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge__marker').attr('style')).to.equal('width: 30%');
          expect(find('table tbody tr td:nth-child(2) .progression-gauge__tooltip').text()).to.include('30%');
        });
      });
    });
  });
});
