import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

module('Acceptance | Campaigns | Start Campaigns with type Profiles Collection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let campaign;

  module('Start a campaign', function (hooks) {
    let campaignParticipant;

    hooks.beforeEach(function () {
      campaignParticipant = server.create('user', 'withEmail');
    });

    module('When user is not logged in', function () {
      module('When campaign has external id', function () {
        module('When participant external id is not set in the url', function (hooks) {
          hooks.beforeEach(async function () {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'email' });
            const screen = await startCampaignByCode(campaign.code);
            await fillIn('#firstName', campaignParticipant.firstName);
            await fillIn('#lastName', campaignParticipant.lastName);
            await fillIn('#email', campaignParticipant.email);
            await fillIn('#password', campaignParticipant.password);
            await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
            await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));
          });

          test('should redirect to send profile page after completion of external id', async function (assert) {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        module('When participant external id is set in the url', function () {
          module('When campaign is not restricted', function () {
            test('should redirect to send profile page', async function (assert) {
              // given & when
              campaign = server.create('campaign', {
                type: PROFILES_COLLECTION,
                isRestricted: false,
                idPixLabel: 'toto',
              });
              const screen = await startCampaignByCodeAndExternalId(campaign.code);
              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#email', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
              await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });

          module('When campaign is restricted', function () {
            test('should redirect to send profile page', async function (assert) {
              //given
              campaign = server.create('campaign', {
                type: PROFILES_COLLECTION,
                isRestricted: true,
                idPixLabel: 'toto',
                organizationType: 'SCO',
              });
              await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
              await clickByLabel("C'est parti !");

              // when
              await click('#login-button');

              await fillIn('#login', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#submit-connexion');

              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));
              await clickByLabel(this.intl.t('pages.join.sco.associate'));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });
        });
      });

      module('When campaign does not have external id', function () {
        test('should redirect to send profile page after signup', async function (assert) {
          // given & when
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          const screen = await startCampaignByCode(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
          await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should redirect to send profile page after signup', async function (assert) {
          // given
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          const screen = await startCampaignByCodeAndExternalId(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

          // when
          await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticate(campaignParticipant);
      });

      module('When campaign is not restricted', function () {
        test('should redirect to landing page', async function (assert) {
          // when
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await visit(`/campagnes/${campaign.code}`);
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          assert.strictEqual(find('.campaign-landing-page__start-button').textContent.trim(), "C'est parti !");
        });
      });

      module('When campaign is restricted', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', {
            type: PROFILES_COLLECTION,
            isRestricted: true,
            idPixLabel: 'nom de naissance de maman',
            organizationType: 'SCO',
          });
        });

        module('When association is not already done', function () {
          test('should redirect to send profile page', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel("C'est parti !");
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.associate'));
            await fillIn('#id-pix-label', 'truc');

            // when
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
          });

          module('When user has already a reconciled account', function (hooks) {
            hooks.beforeEach(function () {
              server.post('/sco-organization-learners/association', () => {
                return new Response(409, {}, { errors: [{ status: '409', meta: { shortCode: 'R11' } }] });
              });
            });

            test('should display error modal when fields are filled in', async function (assert) {
              // given
              const screen = await visit(`/campagnes/${campaign.code}`);
              await clickByLabel("C'est parti !");

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));

              //then
              assert.ok(screen.getByRole('dialog', { name: this.intl.t('pages.join.sco.login-information-title') }));
            });

            test('should redirect to connection form when continue button is clicked', async function (assert) {
              // given
              const screen = await visit(`/campagnes/${campaign.code}`);
              await clickByLabel("C'est parti !");

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));
              await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

              //then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/identification`);
              assert.ok(screen.getByRole('button', { name: 'Se connecter' }));
            });
          });
        });
      });

      module('When campaign has external id', function () {
        module('When participant external id is not set in the url', function () {
          test('should redirect to send profile page when the user fill in his id', async function (assert) {
            // given
            campaign = server.create('campaign', {
              type: PROFILES_COLLECTION,
              idPixLabel: 'nom de naissance de maman',
            });
            await startCampaignByCode(campaign.code);

            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        module('When participant external id is set in the url', function () {
          test('should redirect to send profile page', async function (assert) {
            // given & when
            campaign = server.create('campaign', {
              type: PROFILES_COLLECTION,
              idPixLabel: 'nom de naissance de maman',
            });
            await startCampaignByCodeAndExternalId(campaign.code);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });
      });

      module('When campaign does not have external id', function (hooks) {
        hooks.beforeEach(async function () {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await visit(`campagnes/${campaign.code}`);
        });

        test('should redirect to send profile page after clicking on start button in landing page', async function (assert) {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      module(
        'When campaign does not have external id but a participant external id is set in the url',
        function (hooks) {
          hooks.beforeEach(async function () {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
            await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
          });

          test('should redirect to send profile page after clicking on start button in landing page', async function (assert) {
            // when
            await click('.campaign-landing-page__start-button');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        }
      );
    });
  });
});
