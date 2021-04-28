import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import {
  startCampaignByCode,
  startCampaignByCodeAndExternalId,
} from '../helpers/campaign';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

describe('Acceptance | Campaigns | Start Campaigns with type Profiles Collection', function() {
  setupApplicationTest();
  setupMirage();
  let campaign;

  beforeEach(function() {
    this.server.schema.students.create({
      firstName: 'JeanPrescrit',
      lastName: 'Campagne',
      username: '',
      userId: null,
      organizationId: null,
    });
  });

  describe('Start a campaign', function() {
    let campaignParticipant;

    beforeEach(function() {
      campaignParticipant = server.create('user', 'withEmail');
    });

    context('When user is not logged in', function() {

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
              campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true, idPixLabel: 'toto', organizationType: 'SCO' });
              await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);

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
              await click('button[aria-label="Associer"]');
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
          expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal('C\'est parti !');
        });
      });

      context('When campaign is restricted', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, isRestricted: true, idPixLabel: 'nom de naissance de maman', organizationType: 'SCO' });
        });

        context('When association is not already done', function() {
          it('should redirect to send profile page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');
            await click('button[aria-label="Associer"]');
            await click('.button');
            await fillIn('#id-pix-label', 'truc');

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });

          context('When user has already a reconciled account', function() {

            beforeEach(function() {
              server.post('/schooling-registration-user-associations', () => {
                return new Response(409, {}, { errors: [{ status: '409', meta: { shortCode: 'R11' } }] });
              });
            });

            it('should display error modal when fields are filled in', async function() {
              // given
              await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');

              await click('.button');

              //then
              expect(find('.join-error-modal')).to.exist;
            });

            it('should redirect to connection form when continue button is clicked', async function() {
              // given
              await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');

              await click('.button');
              await click('button[aria-label="Continuer avec mon compte Pix"]');

              //then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification?displayRegisterForm=false`);
            });
          });
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCode(campaign.code);
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
  });
});
