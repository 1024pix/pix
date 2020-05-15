import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  authenticateByEmail,
  authenticateByGAR,
} from '../helpers/authentification';
import {
  startCampaignByCode,
  startCampaignByCodeAndExternalId
} from '../helpers/campaign';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

describe('Acceptance | Campaigns | Start Campaigns with type Collect Profiles', function() {
  setupApplicationTest();
  setupMirage();
  let campaign;

  beforeEach(function() {
    this.server.schema.students.create({
      firstName: 'JeanPrescrit',
      lastName: 'Campagne',
      username: '',
      userId: null,
      organizationId: null
    });
  });

  describe('Start a campaign', function() {
    let campaignParticipant;

    beforeEach(function() {
      campaignParticipant = server.create('user', 'withEmail');
    });

    context('When user is not logged in', function() {

      context('When user want to access a campaign with only its code', function() {

        context('When campaign code exists', function() {

          context('When campaign is not restricted', function() {

            it('should access presentation page', async function() {
              // given
              const campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: false });
              await visit('/campagnes');

              // when
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');

              // then
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code.toLowerCase()}/presentation`);
            });
          });

          context('When campaign is restricted', function() {

            beforeEach(function() {
              campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true });
            });

            context('When the student has an account but is not reconcilied', function() {

              it('should redirect to reconciliation page', async function() {
                // given
                await visit('/campagnes');

                // when
                await fillIn('#campaign-code', campaign.code);
                await click('.fill-in-campaign-code__start-button');
                await click('#login-button');
                await fillIn('#login', campaignParticipant.email);
                await fillIn('#password', campaignParticipant.password);
                await click('#submit-connexion');

                // then
                expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code.toLowerCase()}/restreinte/rejoindre`);
              });
            });

            it('should redirect to login-or-register page', async function() {
              // when
              await visit(`/campagnes/${campaign.code}`);

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/identification`);
            });

            it('should redirect to landing page when reconciliation and registration are done', async function() {
              // given
              await visit(`/campagnes/${campaign.code}`);

              // when
              await fillIn('#firstName', 'JeanPrescrit');
              await fillIn('#lastName', 'Campagne');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await click('#submit-search');

              await fillIn('#username', 'jeanprescrit1012');
              await fillIn('#password', 'pix123');
              await click('#submit-registration');

              // then
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code.toLowerCase()}/presentation`);
            });

            it('should redirect to join restricted campaign page when connection is done', async function() {
              // given
              await visit(`/campagnes/${campaign.code}`);
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/identification`);

              // when
              await click('#login-button');
              await fillIn('#login', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#submit-connexion');

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/rejoindre`);
            });

            it('should redirect to landing page when fields are filled in', async function() {
              // given
              await visit(`/campagnes/${campaign.code}`);
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/identification`);

              await click('#login-button');
              await fillIn('#login', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#submit-connexion');

              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/rejoindre`);

              // when
              await fillIn('#firstName', 'Jane');
              await fillIn('#lastName', 'Acme');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');

              await click('.button');

              //then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
            });

          });
        });
      });

      context('When the user has already seen the landing page', function() {
        beforeEach(async function() {
          const campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await startCampaignByCode(campaign.code);
        });

        it('should redirect to signin page', async function() {
          // then
          expect(currentURL()).to.equal('/inscription');
        });
      });

      context('When the user has not seen the landing page', function() {
        it('should redirect to landing page', async function() {
          // when
          const campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await visit(`/campagnes/${campaign.code}`);

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });

        context('When campaign has custom text for the landing page', function() {
          it('should show the custom text on the landing page', async function() {
            // given
            const campaign = server.create('campaign', { type: PROFILES_COLLECTION, customLandingPageText: 'SomeText' });

            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.exist;
            expect(find('.campaign-landing-page__start__custom-text').textContent).to.contains(campaign.customLandingPageText);
          });
        });

        context('When campaign does not have custom text for the landing page', function() {
          it('should show only the defaulted text on the landing page', async function() {
            // when
            const campaign = server.create('campaign', { type: PROFILES_COLLECTION, customLandingPageText: null });
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.not.exist;
          });
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'email' });
            await startCampaignByCode(campaign.code);
            await fillIn('#firstName', campaignParticipant.firstName);
            await fillIn('#lastName', campaignParticipant.lastName);
            await fillIn('#email', campaignParticipant.email);
            await fillIn('#password', campaignParticipant.password);
            await click('#pix-cgu');
            await click('.button');
          });

          it('should redirect to fill-in-id-pix page after signup', async function() {
            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });

          it('should redirect to send profile page after completion of external id', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        context('When participant external id is set in the url', function() {

          context('When campaign is not restricted', function() {
            beforeEach(async function() {
              campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: false, idPixLabel: 'toto' });
              await startCampaignByCodeAndExternalId(campaign.code);
              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#email', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#pix-cgu');
              await click('.button');
            });

            it('should redirect to send profile page', async function() {
              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });

          context('When campaign is restricted', function() {
            beforeEach(async function() {
              campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true, idPixLabel: 'toto' });
              await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/identification`);

              await click('#login-button');

              await fillIn('#login', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#submit-connexion');

              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await click('.button');
              await click('.campaign-landing-page__start-button');
            });

            it('should redirect to send profile page', async function() {
              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });
        });
      });

      context('When campaign does not have external id', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await startCampaignByCode(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to send profile page after signup', async function() {
          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await startCampaignByCodeAndExternalId(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to send profile page after signup', async function() {
          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateByEmail(campaignParticipant);
      });

      context('When campaign is not restricted', function() {

        it('should redirect to landing page', async function() {
          // when
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await visit(`/campagnes/${campaign.code}`);
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal('C’est parti !');
        });
      });

      context('When campaign is restricted', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true, idPixLabel: 'nom de naissance de maman' });
        });

        context('When association is not already done', function() {

          it('should redirect to join restricted campaign page when campaign code is in url', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/restreinte/rejoindre`);
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should redirect to join restricted campaign page', async function() {
            // given
            await visit('/campagnes');

            //when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            //then
            expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code.toLowerCase()}/restreinte/rejoindre`);
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should not set any field by default', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            //then
            expect(find('#firstName').value).to.equal('');
            expect(find('#lastName').value).to.equal('');
          });

          it('should redirect to landing page when fields are filled in', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            // when
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to fill-in-id-pix page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });

          it('should redirect to send profile page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);
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
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        context('When association is already done', function() {

          beforeEach(async function() {
            server.create('student', {
              userId: campaignParticipant.id,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to fill-in-id-pix page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCode(campaign.code);
          });

          it('should show the identifiant page after clicking on start button in landing page', async function() {
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });

          it('should redirect to send profile page when the user fill in his id', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        context('When participant external id is set in the url', function() {
          beforeEach(async function() {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCodeAndExternalId(campaign.code);
          });

          it('should redirect to send profile page', async function() {
            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });
      });

      context('When campaign does not have external id', function() {

        beforeEach(async function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await visit(`campagnes/${campaign.code}`);
        });

        it('should redirect to send profile page after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
        });

        it('should redirect to send profile page after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });

    context('When user is logged in with an external platform', function() {
      let garUser;

      beforeEach(async function() {
        garUser = server.create('user', 'external');
        await authenticateByGAR(garUser);
      });

      context('When campaign is restricted', function() {
        beforeEach(function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true });
        });

        context('When association is not already done', function() {

          it('should set by default firstName and lastName', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            //then
            expect(find('#firstName').value).to.equal(garUser.firstName);
            expect(find('#lastName').value).to.equal(garUser.lastName);
          });

          it('should redirect to landing page when fields are filled in', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            // when
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });
        });

        context('When association is already done', function() {

          beforeEach(async function() {
            server.create('student', {
              userId: garUser.id,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/restreinte/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });
        });
      });
    });
  });
});
