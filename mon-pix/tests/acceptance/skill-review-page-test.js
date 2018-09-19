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

      const profileCompletionRate = 64;
      const requestedAssessmentId = 1;
      const campaignId = 1;
      const campaignParticipationId = 1;

      //ressources
      const skillReview = { profileCompletionRate };
      const assessment = { id: requestedAssessmentId, skillReview };
      const campaignParticipation = { id: campaignParticipationId };

      beforeEach(async function() {
        //STUB
        server.get('/campaign-participations', () => {
          return server.createList('campaign-participation', 1, [campaignParticipation]);
        });
        server.get('/assessment/:id', () => {
          return server.create('assessment', assessment);
        });
        server.patch('/campaign-participations/:id', () => {
          return new Promise((resolve) => {
            resolve(new Response(204));
          });
        });

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
