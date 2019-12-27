import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser, authenticateAsSimpleExternalUser, startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

function _buildCampaignParticipation(schema) {
  const assessment = schema.assessments.create({});
  return schema.campaignParticipations.create({ assessment });
}

describe('Acceptance | Campaigns | Start Campaigns', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Start a campaigns course', function() {

    context('When user is not logged in', function() {

      context('When user has not given any campaign code', function() {

        it('should access campaign form page', async function() {
          // when
          await visitWithAbortedTransition('/campagnes');

          // then
          expect(find('.button').textContent).to.contains('Commencer mon parcours');
        });
      });

      context('When user want to access a campaign with only its code', function() {

        context('When campaign code exists', function() {

          context('When campaign is not restricted', function() {

            it('should access presentation page', async function() {
              // given
              const campaignCode = 'AZERTY1';
              await visitWithAbortedTransition('/campagnes');

              // when
              await fillIn('#campaign-code', campaignCode);
              await click('.button');

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
            });
          });

          context('When campaign is restricted', function() {
            const campaignCode = 'AZERTY4';

            it('should redirect to login-or-register page', async function() {
              // when
              await visitWithAbortedTransition(`/campagnes/${campaignCode}`);

              // then
              expect(currentURL()).to.equal('/identification');
            });

            it('should redirect to join restricted campaign page when registration is done', async function() {
              // given
              await visitWithAbortedTransition(`/campagnes/${campaignCode}`);

              expect(currentURL()).to.equal('/identification');

              // when
              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#email', 'jane@acme.com');
              await fillIn('#password', 'Jane1234');
              await click('#submit-registration');

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaignCode}/rejoindre`);
            });

            it('should redirect to join restricted campaign page when connexion is done', async function() {
              // given
              await visitWithAbortedTransition(`/campagnes/${campaignCode}`);

              expect(currentURL()).to.equal('/identification');

              // when
              await click('#login');
              await fillIn('#email', 'jane@acme.com');
              await fillIn('#password', 'Jane1234');
              await click('#submit-connexion');

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaignCode}/rejoindre`);
            });

            it('should redirect to landing page when fields are filled in', async function() {
              // given
              await visitWithAbortedTransition(`/campagnes/${campaignCode}`);

              expect(currentURL()).to.equal('/identification');

              await click('#login');
              await fillIn('#email', 'jane@acme.com');
              await fillIn('#password', 'Jane1234');
              await click('#submit-connexion');

              expect(currentURL()).to.equal(`/campagnes/${campaignCode}/rejoindre`);

              // when
              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');

              await click('.button');

              //then
              expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
            });

          });
        });

        context('When campaign code does not exist', function() {

          it('should display an error message on fill-in-campaign-code page', async function() {
            // given
            const campaignCode = 'AZERTY123';
            await visitWithAbortedTransition('/campagnes');

            // when
            await fillIn('#campaign-code', campaignCode);
            await click('.button');

            // then
            expect(currentURL()).to.equal('/campagnes');
            expect(find('.fill-in-campaign-code__error').textContent)
              .to.contains('Votre code de parcours est erroné, veuillez vérifier ou contacter la personne organisant le parcours de test.');
          });
        });

        context('When user validates with empty campaign code', function() {

          it('should display an error', async function() {
            // given
            await visitWithAbortedTransition('/campagnes');

            // when
            await click('.button');

            // then
            expect(currentURL()).to.equal('/campagnes');
            expect(find('.fill-in-campaign-code__error').textContent).to.contains('Merci de renseigner le code du parcours.');
          });
        });
      });

      context('When the user has already seen the landing page', function() {
        beforeEach(async function() {
          await startCampaignByCode('AZERTY1');
        });

        it('should redirect to signin page', async function() {
          // then
          expect(currentURL()).to.equal('/inscription');
        });
      });

      context('When the user has not seen the landing page', function() {
        it('should redirect to landing page', async function() {
          // when
          await visitWithAbortedTransition('/campagnes/AZERTY1');

          // then
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
        });

        context('When campaign has custom text for the landing page', function() {
          it('should show the custom text on the landing page', async function() {
            // given
            this.server.create('campaign', {
              id: '3',
              name: 'Campagne 3',
              code: 'AZERTY3',
              customLandingPageText: 'Texte personnalisé pour la Campagne 3'
            });

            // when
            await visitWithAbortedTransition('/campagnes/AZERTY3');

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.exist;
            expect(find('.campaign-landing-page__start__custom-text').textContent).to.contains('Texte personnalisé pour la Campagne 3');
          });
        });

        context('When campaign does not have custom text for the landing page', function() {
          it('should show only the defaulted text on the landing page', async function() {
            // when
            await visitWithAbortedTransition('/campagnes/AZERTY1');

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.not.exist;
          });
        });

      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {
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
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });

          it('should redirect to assessment after completion of external id', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');

            // then
            expect(currentURL()).to.contains('/didacticiel');
          });
        });

        context('When participant external id is set in the url', function() {

          context('When campaign is not restricted', function() {
            beforeEach(async function() {
              await startCampaignByCodeAndExternalId('AZERTY1');
              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#email', 'jane@acme.com');
              await fillIn('#password', 'Jane1234');
              await click('#pix-cgu');
              await click('.button');
            });

            it('should redirect to assessment', async function() {
              // then
              expect(currentURL()).to.contains('/didacticiel');
            });
          });

          context('When campaign is restricted', function() {
            beforeEach(async function() {
              await visitWithAbortedTransition('/campagnes/AZERTY4?participantExternalId=a73at01r3');

              expect(currentURL()).to.equal('/identification');

              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#email', 'jane@acme.com');
              await fillIn('#password', 'Jane1234');
              await click('#submit-registration');

              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await click('.button');

              await click('.campaign-landing-page__start-button');
            });

            it('should redirect to assessment', async function() {
              // then
              expect(currentURL()).to.contains('/didacticiel');
            });
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
          expect(currentURL()).to.contains('/didacticiel');
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          await startCampaignByCodeAndExternalId('AZERTY2');
          await fillIn('#firstName', 'Jane');
          await fillIn('#lastName', 'Acme');
          await fillIn('#email', 'jane@acme.com');
          await fillIn('#password', 'Jane1234');
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to assessment after signup', async function() {
          // then
          expect(currentURL()).to.contains('/didacticiel');
        });
      });

    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateAsSimpleUser();
      });

      context('When campaign is not restricted', function() {

        it('should redirect to landing page', async function() {
          // when
          await visitWithAbortedTransition('/campagnes/AZERTY1');
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal('Je commence');
        });
      });

      context('When campaign is restricted', function() {
        const campaignCode = 'AZERTY4';

        context('When association is not already done', function() {

          it('should redirect to join restricted campaign page when campaign code is in url', async function() {
            // when
            await visitWithAbortedTransition(`/campagnes/${campaignCode}`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/rejoindre`);
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should redirect to join restricted campaign page', async function() {
            // given
            await visitWithAbortedTransition('/campagnes');

            //when
            await fillIn('#campaign-code', campaignCode);
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/rejoindre`);
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should not set any field by default', async function() {
            // when
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            //then
            expect(find('#firstName').value).to.equal('');
            expect(find('#lastName').value).to.equal('');
          });

          it('should redirect to landing page when fields are filled in', async function() {
            // given
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            // when
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
          });

          it('should redirect to fill-in-id-pix page', async function() {
            // given
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/identifiant`);
          });

          it('should redirect to tutoriel page', async function() {
            // given
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');
            await click('.button');
            await fillIn('#id-pix-label', 'truc');

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/didacticiel`);
          });
        });

        context('When association is already done', function() {

          beforeEach(async function() {
            server.create('student', {
              userId: 1,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
          });

          it('should redirect to fill-in-id-pix page', async function() {
            // given
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/identifiant`);
          });
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            await startCampaignByCode('AZERTY1');
          });

          it('should show the identifiant page after clicking on start button in landing page', async function() {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });

          it('should save the external id when user fill in his id', async function() {
            // given
            const participantExternalId = 'monmail@truc.fr';
            let receivedParticipantExternalId;
            this.server.post('/campaign-participations', (schema, request) => {
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
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');

            // then
            expect(currentURL()).to.contains('campagnes/AZERTY1/didacticiel');
          });

          it('should start the assessment when the user has seen tutorial', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__start-campaign-button');

            // then
            expect(currentURL()).to.contains(/assessments/);
          });
        });

        context('When participant external id is set in the url', function() {
          beforeEach(async function() {
            await startCampaignByCodeAndExternalId('AZERTY1');
          });

          it('should redirect to assessment', async function() {
            // then
            expect(currentURL()).to.contains('/didacticiel');
          });

          it('should start the assessment when the user has seen tutorial', async function() {
            // when
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__next-page-tutorial');
            await click('.campaign-tutorial__start-campaign-button');

            // then
            expect(currentURL()).to.contains(/assessments/);
          });
        });
      });

      context('When campaign does not have external id', function() {

        beforeEach(async function() {
          await visitWithAbortedTransition('/campagnes/AZERTY2');
        });

        it('should redirect to tutorial after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.contains('campagnes/AZERTY2/didacticiel');
        });

        it('should not save any external id after clicking on start button in landing page', async function() {
          // given
          let receivedParticipantExternalId;
          this.server.post('/campaign-participations', (schema, request) => {
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

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          await visitWithAbortedTransition('/campagnes/AZERTY2?participantExternalId=a73at01r3');
        });

        it('should redirect to tutorial after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.contains('campagnes/AZERTY2/didacticiel');
        });

        it('should not save any external id after clicking on start button in landing page', async function() {
          // given
          let receivedParticipantExternalId;
          this.server.post('/campaign-participations', (schema, request) => {
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
          await visitWithAbortedTransition('/campagnes/codefaux');
        });

        it('should show an error message', async function() {
          // then
          expect(currentURL()).to.equal('/campagnes/codefaux');
          expect(find('.title').textContent).to.contains('La campagne demandée n’est pas accessible.');
        });
      });

    });

    context('When user is logged in with an external platform', function() {
      beforeEach(async function() {
        await authenticateAsSimpleExternalUser();
      });

      context('When campaign is restricted', function() {
        const campaignCode = 'AZERTY4';

        context('When association is not already done', function() {

          it('should set by default firstName and lastName', async function() {
            // when
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            //then
            expect(find('#firstName').value).to.equal('JaneExternal');
            expect(find('#lastName').value).to.equal('Doe');
          });

          it('should redirect to landing page when fields are filled in', async function() {
            // given
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            // when
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
          });
        });

        context('When association is already done', function() {

          beforeEach(async function() {
            server.create('student', {
              userId: 3,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visitWithAbortedTransition(`/campagnes/${campaignCode}/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaignCode}/presentation`);
          });
        });
      });
    });
  });
});
