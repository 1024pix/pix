import { click, fillIn, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import setupIntl from '../helpers/setup-intl';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';
const PASSWORD_INPUT_LABEL = 'Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)';
const EMAIL_INPUT_LABEL = 'Adresse e-mail (ex: nom@exemple.fr)';
const FIRST_NAME_INPUT_LABEL = 'Prénom';
const LAST_NAME_INPUT_LABEL = 'Nom';
const DAY_BIRTH_INPUT_LABEL = 'jour de naissance';
const MONTH_BIRTH_INPUT_LABEL = 'mois de naissance';
const YEAR_BIRTH_INPUT_LABEL = 'année de naissance';

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
        module('When participant external id is not set in the url', function () {
          test('should redirect to send profile page after completion of external id', async function (assert) {
            // then
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'Adresse e-mail' });
            const screen = await startCampaignByCode(campaign.code);
            await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), campaignParticipant.firstName);
            await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), campaignParticipant.lastName);
            await fillIn(screen.getByRole('textbox', { name: EMAIL_INPUT_LABEL }), campaignParticipant.email);
            await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), campaignParticipant.password);
            await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
            await click(screen.getByRole('button', { name: "Je m'inscris" }));

            // when
            await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'monmail@truc.fr');
            await click(screen.getByRole('button', { name: 'Continuer' }));

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
              await fillIn(
                screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }),
                campaignParticipant.firstName
              );
              await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), campaignParticipant.lastName);
              await fillIn(screen.getByRole('textbox', { name: EMAIL_INPUT_LABEL }), campaignParticipant.email);
              await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), campaignParticipant.password);
              await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
              await click(screen.getByRole('button', { name: "Je m'inscris" }));

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
              const screen = await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
              await click(screen.getByRole('button', { name: "C'est parti !" }));

              // when
              await click(screen.getByRole('button', { name: 'Se connecter' }));
              await fillIn(
                screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }),
                campaignParticipant.email
              );
              await fillIn(screen.getByLabelText('Mot de passe'), campaignParticipant.password);
              await click(screen.getByRole('button', { name: 'Se connecter' }));
              await fillIn(
                screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }),
                campaignParticipant.firstName
              );
              await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), campaignParticipant.lastName);
              await fillIn(screen.getByRole('textbox', { name: DAY_BIRTH_INPUT_LABEL }), '10');
              await fillIn(screen.getByRole('textbox', { name: MONTH_BIRTH_INPUT_LABEL }), '12');
              await fillIn(screen.getByRole('textbox', { name: YEAR_BIRTH_INPUT_LABEL }), '2000');
              await click(screen.getByRole('button', { name: "C'est parti !" }));
              await click(screen.getByRole('button', { name: 'Associer' }));

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
          await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), campaignParticipant.firstName);
          await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), campaignParticipant.lastName);
          await fillIn(screen.getByRole('textbox', { name: EMAIL_INPUT_LABEL }), campaignParticipant.email);
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), campaignParticipant.password);
          await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
          await click(screen.getByRole('button', { name: "Je m'inscris" }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should redirect to send profile page after signup', async function (assert) {
          // given
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          const screen = await startCampaignByCodeAndExternalId(campaign.code);
          await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), campaignParticipant.firstName);
          await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), campaignParticipant.lastName);
          await fillIn(screen.getByRole('textbox', { name: EMAIL_INPUT_LABEL }), campaignParticipant.email);
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), campaignParticipant.password);
          await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

          // when
          await click(screen.getByRole('button', { name: "Je m'inscris" }));

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
          const screen = await visit(`/campagnes/${campaign.code}`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          assert.dom(screen.getByRole('button', { name: "C'est parti !" })).exists();
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
            const screen = await visit(`/campagnes/${campaign.code}`);
            await click(screen.getByRole('button', { name: "C'est parti !" }));
            await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), 'Robert');
            await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), 'Smith');
            await fillIn(screen.getByRole('textbox', { name: DAY_BIRTH_INPUT_LABEL }), '10');
            await fillIn(screen.getByRole('textbox', { name: MONTH_BIRTH_INPUT_LABEL }), '12');
            await fillIn(screen.getByRole('textbox', { name: YEAR_BIRTH_INPUT_LABEL }), '2000');
            await click(screen.getByRole('button', { name: "C'est parti !" }));
            await click(screen.getByRole('button', { name: 'Associer' }));

            await fillIn(screen.getByRole('textbox', { name: 'nom de naissance de maman' }), 'truc');

            // when
            await click(screen.getByRole('button', { name: 'Continuer' }));

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
              await click(screen.getByRole('button', { name: "C'est parti !" }));

              // when
              await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), 'Robert');
              await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), 'Smith');
              await fillIn(screen.getByRole('textbox', { name: DAY_BIRTH_INPUT_LABEL }), '10');
              await fillIn(screen.getByRole('textbox', { name: MONTH_BIRTH_INPUT_LABEL }), '12');
              await fillIn(screen.getByRole('textbox', { name: YEAR_BIRTH_INPUT_LABEL }), '2000');
              await click(screen.getByRole('button', { name: "C'est parti !" }));

              //then
              assert.ok(screen.getByRole('dialog', { name: this.intl.t('pages.join.sco.login-information-title') }));
            });

            test('should redirect to connection form when continue button is clicked', async function (assert) {
              // given
              const screen = await visit(`/campagnes/${campaign.code}`);
              await click(screen.getByRole('button', { name: "C'est parti !" }));

              // when
              await fillIn(screen.getByRole('textbox', { name: FIRST_NAME_INPUT_LABEL }), 'Robert');
              await fillIn(screen.getByRole('textbox', { name: LAST_NAME_INPUT_LABEL }), 'Smith');
              await fillIn(screen.getByRole('textbox', { name: DAY_BIRTH_INPUT_LABEL }), '10');
              await fillIn(screen.getByRole('textbox', { name: MONTH_BIRTH_INPUT_LABEL }), '12');
              await fillIn(screen.getByRole('textbox', { name: YEAR_BIRTH_INPUT_LABEL }), '2000');
              await click(screen.getByRole('button', { name: "C'est parti !" }));
              await click(screen.getByRole('button', { name: 'Continuer avec mon compte Pix' }));

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
            const screen = await startCampaignByCode(campaign.code);

            // when
            await fillIn(screen.getByRole('textbox', { name: 'nom de naissance de maman' }), 'truc');
            await click(screen.getByRole('button', { name: 'Continuer' }));

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

      module('When campaign does not have external id', function () {
        test('should redirect to send profile page after clicking on start button in landing page', async function (assert) {
          // given
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          const screen = await visit(`campagnes/${campaign.code}`);

          // when
          await click(screen.getByRole('button', { name: "C'est parti !" }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should redirect to send profile page after clicking on start button in landing page', async function (assert) {
          // given
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          const screen = await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

          // when
          await click(screen.getByRole('button', { name: "C'est parti !" }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });
  });
});
