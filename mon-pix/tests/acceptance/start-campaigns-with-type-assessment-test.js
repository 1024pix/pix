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
import { clickByLabel } from '../helpers/click-by-label';

const ASSESSMENT = 'ASSESSMENT';

describe('Acceptance | Campaigns | Start Campaigns with type Assessment', function() {
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
      studentNumber: '123A',
    });

    this.server.schema.users.create({
      mustValidateTermsOfService: true,
    });
  });

  describe('Start a campaign', function() {
    let prescritUser;

    beforeEach(function() {
      prescritUser = server.create('user', 'withEmail', {
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
      });
    });

    context('When user is not logged in', function() {

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT });
            await startCampaignByCode(campaign.code);
            await fillIn('#firstName', prescritUser.firstName);
            await fillIn('#lastName', prescritUser.lastName);
            await fillIn('#email', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#pix-cgu');
            await click('.button');
          });

          it('should redirect to assessment after completion of external id', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');

            await clickByLabel('Continuer');

            // then
            expect(currentURL()).to.contains('/didacticiel');
          });

          it('should redirect to campaign presentation after cancel button', async function() {
            // when
            await clickByLabel('Annuler');

            // then
            expect(currentURL()).to.contains(`/campagnes/${campaign.code}/presentation`);
          });
        });

        context('When participant external id is set in the url', function() {

          context('When campaign is not restricted', function() {
            beforeEach(async function() {
              campaign = server.create('campaign', { isRestricted: false, idPixLabel: 'toto', type: ASSESSMENT });
              await startCampaignByCodeAndExternalId(campaign.code);
              await fillIn('#firstName', prescritUser.firstName);
              await fillIn('#lastName', prescritUser.lastName);
              await fillIn('#email', prescritUser.email);
              await fillIn('#password', prescritUser.password);
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
              campaign = server.create('campaign', 'restricted', { idPixLabel: 'toto', organizationType: 'SCO', type: ASSESSMENT });
              await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);

              await click('#login-button');

              await fillIn('#login', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#submit-connexion');

              await fillIn('#firstName', prescritUser.firstName);
              await fillIn('#lastName', prescritUser.lastName);
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await click('.button');
              await click('button[aria-label="Associer"]');
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
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          await startCampaignByCode(campaign.code);
          await fillIn('#firstName', prescritUser.firstName);
          await fillIn('#lastName', prescritUser.lastName);
          await fillIn('#email', prescritUser.email);
          await fillIn('#password', prescritUser.password);
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
          campaign = server.create('campaign', { type: ASSESSMENT });
          await startCampaignByCodeAndExternalId(campaign.code);
          await fillIn('#firstName', prescritUser.firstName);
          await fillIn('#lastName', prescritUser.lastName);
          await fillIn('#email', prescritUser.email);
          await fillIn('#password', prescritUser.password);
          await click('#pix-cgu');
          await click('.button');
        });

        it('should redirect to assessment after signup', async function() {
          // then
          expect(currentURL()).to.contains('/didacticiel');
        });
      });

      context('When campaign does not require external id and is for absolute novice', function() {

        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT, isForAbsoluteNovice: true });
          await visit(`/campagnes/${campaign.code}`);
        });

        it('should redirect to signup page when starting a campaign', async function() {
          // then
          expect(currentURL()).to.contains('/inscription');
        });
      });

    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateByEmail(prescritUser);
      });

      context('When campaign is not restricted', function() {

        it('should redirect to landing page', async function() {
          // when
          campaign = server.create('campaign', { type: ASSESSMENT });
          await visit(`/campagnes/${campaign.code}`);
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal('Je commence');
        });
      });

      context('When campaign is restricted', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { isRestricted: true, idPixLabel: 'nom de naissance de maman', type: ASSESSMENT, organizationType: 'SCO' });
        });

        context('When association is not already done', function() {
          it('should redirect to tutoriel page', async function() {
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
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });
            await startCampaignByCode(campaign.code);
          });

          it('should go to the tutorial when the user fill in his id', async function() {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await click('.button');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
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
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });
            await startCampaignByCodeAndExternalId(campaign.code);
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
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          await visit(`campagnes/${campaign.code}`);
        });

        it('should redirect to tutorial after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.contains('/didacticiel');
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
        });

        it('should redirect to tutorial after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.contains('/didacticiel');
        });
      });

      context('When campaign does not have external id and is for absolute novice', function() {

        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT, isForAbsoluteNovice: true });
          await visit(`campagnes/${campaign.code}`);
        });

        it('should redirect to assessment when starting a campaign', async function() {
          // then
          expect(currentURL()).to.not.contains('/didacticiel');
          expect(currentURL()).to.contains('/assessments');
        });
      });
    });
  });
});
