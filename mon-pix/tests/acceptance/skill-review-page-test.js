import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
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
        authenticateAsSimpleUser();
        await visit(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
      });

      it('should access to the page', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.equal(`/campagnes/${campaignId}/resultats/${requestedAssessmentId}`);
        });
      });
    });
  });
});
