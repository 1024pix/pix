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

      context('When user has not given any campaign code', function() {

        it('should access campaign form page', async function() {
          // when
          await visit('/campagnes');

          // then
          expect(find('.button').text()).to.contains('Commencer mon parcours');
        });
      });

      context('When user want to access a campaign with only its code', function() {

        it('should access presentation page', async function() {
          // given
          const campaignCode = 'AZERTY1';
          await visit('/campagnes');

          // when
          await fillIn('#campaign-code', campaignCode);
          await click('.button');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
        });

        context('When campaign code does not exist', function() {

          it('should display an error message on fill-in-campaign-code page', async function() {
            // given
            const campaignCode = 'AZERTY123';
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaignCode);
            await click('.button');

            // then
            expect(currentURL()).to.equal('/campagnes');
            expect(find('.fill-in-campaign-code__error').text())
              .to.contains('Votre code de parcours est erroné, veuillez vérifier ou contacter la personne organisant le parcours de test.');
          });
        });

        context('When user validates with empty campaign code', function() {

          it('should display an error', async function() {
            // given
            await visit('/campagnes');

            // when
            await click('.button');

            // then
            expect(currentURL()).to.equal('/campagnes');
            expect(find('.fill-in-campaign-code__error').text()).to.contains('Merci de renseigner le code du parcours.');
          });
        });
      });

      context('When the user has already seen the landing page', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
        });

        it('should redirect to signin page', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/inscription');
          });
        });
      });

      context('When the user has not seen the landing page', function() {
        it('should redirect to landing page', async function() {
          // when
          await visit('/campagnes/AZERTY1');

          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          });
        });

        context('When campaign has custom text for the landing page', function() {
          it('should show the custom text on the landing page', async function() {
            // given
            server.create('campaign', {
              id: '3',
              name: 'Campagne 3',
              code: 'AZERTY3',
              customLandingPageText: 'Texte personnalisé pour la Campagne 3'
            });

            // when
            await visit('/campagnes/AZERTY3');

            // then
            return andThen(() => {
              expect(find('.campaign-landing-page__start__custom-text')).to.have.lengthOf(1);
              expect(find('.campaign-landing-page__start__custom-text').text()).to.contains('Texte personnalisé pour la Campagne 3');
            });
          });
        });

        context('When campaign does not have custom text for the landing page', function() {
          it('should show only the defaulted text on the landing page', async function() {
            // when
            await visit('/campagnes/AZERTY1');

            // then
            return andThen(() => {
              expect(find('.campaign-landing-page__start__custom-text')).to.have.lengthOf(0);
            });
          });
        });

      });

      context('When campaign has external id', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
          await fillIn('#firstName', 'Jane');
          await fillIn('#lastName', 'Acme');
          await fillIn('#email', 'jane@acme.com');
          await fillIn('#password', 'Jane1234');
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to fill-in-id-pix page after signup', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should redirect to assessment after completion of external id', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/didacticiel');
          });
        });
      });

      context('When campaign does not have external id', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY2');
          await fillIn('#firstName', 'Jane');
          await fillIn('#lastName', 'Acme');
          await fillIn('#email', 'jane@acme.com');
          await fillIn('#password', 'Jane1234');
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to assessment after signup', async function() {
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
          findWithAssert('.campaign-landing-page__logo');
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
          await click('.button');

          // then
          expect(receivedParticipantExternalId).to.equal(participantExternalId);
        });

        it('should go to the tutorial when the user fill in his id', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('campagnes/AZERTY1/didacticiel');
          });
        });

        it('should start the assessment when the user has seen tutorial', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.button');
          await click('.campaign-tutorial__next-page-tutorial');
          await click('.campaign-tutorial__next-page-tutorial');
          await click('.campaign-tutorial__next-page-tutorial');
          await click('.campaign-tutorial__start-campaign-button');

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
            expect(find('.title').text()).to.contains('La campagne demandée n\'existe pas.');
          });
        });
      });

    });

  });
});
