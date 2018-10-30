import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser, startCampaignByCode } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

function _buildCampaignParticipation(schema) {
  const assessment = schema.assessments.create({});
  return schema.campaignParticipations.create({ assessment });
}

describe('Acceptance | Campaigns | Start Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Start a campaigns course', function() {

    context('When user is not logged in', function() {

      context('When the user has already seen the landing page', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
        });
        it('should redirect to login page', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/connexion');
          });
        });
      });

      context('When the user has not seen the landing page', function() {
        beforeEach(async function() {
          await visit('/campagnes/AZERTY1');
        });
        it('should redirect to landing page', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          });
        });
      });

      context('When campaign have external id', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
          await fillIn('#pix-email', 'jane@acme.com');
          await fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');
        });

        it('should redirect to fill-in-id-pix page after connexion', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should redirect to assessment after completion of external id', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/didacticiel');
          });
        });
      });

      context('When campaign does not have external id', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY2');
          await fillIn('#pix-email', 'jane@acme.com');
          await fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');
        });

        it('should redirect to assessment after connexion', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/didacticiel');
          });
        });
      });

    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateAsSimpleUser();
      });

      it('should redirect to landing page', async function() {
        // when
        await visit('/campagnes/AZERTY1');
        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          expect(find('.campaign-landing-page__start-button').text().trim()).to.equal('Je commence');
        });
      });

      context('When campaign have external id', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
        });

        it('should show the identifiant page after clicking on start button in landing page', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should save the external id when user fill in his id', async function() {
          // given
          const participantExternalId = 'monmail@truc.fr';
          let receivedParticipantExternalId;
          server.post('/campaign-participations', (schema, request) => {
            const params = JSON.parse(request.requestBody);

            receivedParticipantExternalId = params.data.attributes['participant-external-id'];

            return _buildCampaignParticipation(schema);
          });

          // when
          await fillIn('#id-pix-label', participantExternalId);
          await click('.pix-button');

          // then
          expect(receivedParticipantExternalId).to.equal(participantExternalId);
        });

        it('should go to the tutorial when the user fill in his id', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('campagnes/AZERTY1/didacticiel');
          });
        });

        it('should start the assessment when the user has seen tutorial', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');
          await click('.next-page-tutorial');
          await click('.next-page-tutorial');
          await click('.next-page-tutorial');
          await click('.start-first-question');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains(/assessments/);
            expect(find('.course-banner__name').text()).to.equal('');
            findWithAssert('.assessment-challenge__progress-bar');
          });
        });
      });

      context('When campaign does not have external id', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY2');
        });

        it('should redirect to tutorial after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('campagnes/AZERTY2/didacticiel');
          });
        });

        it('should not save any external id after clicking on start button in landing page', async function() {
          // given
          let receivedParticipantExternalId;
          server.post('/campaign-participations', (schema, request) => {
            const params = JSON.parse(request.requestBody);

            receivedParticipantExternalId = params.data.attributes['participant-external-id'];

            return _buildCampaignParticipation(schema);
          });
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(receivedParticipantExternalId).to.equal(null);
        });
      });

      context('When campaign does not exist', function() {
        beforeEach(async function() {
          await visit('/campagnes/codefaux');
        });

        it('should show an error message', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/campagnes/codefaux');
            expect(find('.pix-panel').text()).to.contains('La campagne demandée n\'existe pas.');
          });
        });
      });

    });

  });
});
