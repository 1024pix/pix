import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import setupIntl from '../helpers/setup-intl';

const ASSESSMENT = 'ASSESSMENT';

module('Acceptance | Campaigns | Start Campaigns with type Assessment', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let campaign;

  hooks.beforeEach(function () {
    this.server.schema.users.create({
      mustValidateTermsOfService: true,
    });
  });

  module('Start a campaign', function (hooks) {
    let prescritUser;

    hooks.beforeEach(function () {
      prescritUser = server.create('user', 'withEmail', {
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
      });
    });

    module('When user is not logged in', function () {
      module('When campaign has external id', function () {
        module('When participant external id is not set in the url', function () {
          test('should redirect to assessment after completion of external id', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT });
            const screen = await startCampaignByCode(campaign.code);
            await _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl: this.intl });

            // when
            await fillIn(screen.getByRole('textbox', { name: 'email' }), 'monmail@truc.fr');
            await click(screen.getByRole('button', { name: 'Continuer' }));

            // then
            assert.ok(currentURL().includes('/didacticiel'));
          });

          test('should redirect to campaign presentation after cancel button', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT });
            const screen = await startCampaignByCode(campaign.code);
            await _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl: this.intl });

            // when
            await click(screen.getByRole('button', { name: 'Annuler' }));

            // then
            assert.ok(currentURL().includes(`/campagnes/${campaign.code}/presentation`));
          });
        });

        module('When participant external id is set in the url', function () {
          module('When campaign is not restricted', function () {
            test('should redirect to assessment', async function (assert) {
              // given
              campaign = server.create('campaign', { isRestricted: false, idPixLabel: 'toto', type: ASSESSMENT });
              const screen = await startCampaignByCodeAndExternalId(campaign.code);
              await _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl: this.intl });

              // when & then
              assert.ok(currentURL().includes('/didacticiel'));
            });
          });

          module('When campaign is restricted', function () {
            test('should redirect to assessment', async function (assert) {
              // given
              campaign = server.create('campaign', 'restricted', {
                idPixLabel: 'toto',
                organizationType: 'SCO',
                type: ASSESSMENT,
              });
              const screen = await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
              await click(screen.getByRole('button', { name: 'Je commence' }));

              // when
              await click(screen.getByRole('button', { name: 'Se connecter' }));

              await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), prescritUser.email);
              await fillIn(screen.getByLabelText('Mot de passe'), prescritUser.password);
              await click(screen.getByRole('button', { name: 'Se connecter' }));

              await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), prescritUser.firstName);
              await fillIn(screen.getByRole('textbox', { name: 'Nom' }), prescritUser.lastName);
              await fillIn(screen.getByRole('textbox', { name: 'jour de naissance' }), '10');
              await fillIn(screen.getByRole('textbox', { name: 'mois de naissance' }), '12');
              await fillIn(screen.getByRole('textbox', { name: 'année de naissance' }), '2000');
              await click(screen.getByRole('button', { name: this.intl.t('pages.join.button') }));
              await click(screen.getByRole('button', { name: this.intl.t('pages.join.sco.associate') }));

              // then
              assert.ok(currentURL().includes('/didacticiel'));
            });
          });
        });
      });

      module('When campaign does not have external id', function () {
        test('should redirect to assessment after signup', async function (assert) {
          // given & when
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          const screen = await startCampaignByCode(campaign.code);
          await _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl: this.intl });

          // then
          assert.ok(currentURL().includes('/didacticiel'));
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should redirect to assessment after signup', async function (assert) {
          // given & when
          campaign = server.create('campaign', { type: ASSESSMENT });
          const screen = await startCampaignByCodeAndExternalId(campaign.code);
          await _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl: this.intl });

          // then
          assert.ok(currentURL().includes('/didacticiel'));
        });
      });

      module('When campaign does not require external id and is for absolute novice', function () {
        test('should redirect to signup page when starting a campaign', async function (assert) {
          // given & when
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT, isForAbsoluteNovice: true });
          await visit(`/campagnes/${campaign.code}`);

          // then
          assert.ok(currentURL().includes('/inscription'));
        });
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticate(prescritUser);
      });

      module('When campaign is not restricted', function () {
        test('should redirect to landing page', async function (assert) {
          // when
          campaign = server.create('campaign', { type: ASSESSMENT });
          const screen = await visit(`/campagnes/${campaign.code}`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          assert.dom(screen.getByRole('button', { name: 'Je commence' })).exists();
        });
      });

      module('When campaign is restricted', function () {
        module('When association is not already done', function () {
          test('should redirect to tutoriel page', async function (assert) {
            // given
            campaign = server.create('campaign', {
              isRestricted: true,
              idPixLabel: 'nom de naissance de maman',
              type: ASSESSMENT,
              organizationType: 'SCO',
            });
            const screen = await visit(`/campagnes/${campaign.code}`);
            await click(screen.getByRole('button', { name: 'Je commence' }));
            await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'Rober');
            await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'Smith');
            await fillIn(screen.getByRole('textbox', { name: 'jour de naissance' }), '10');
            await fillIn(screen.getByRole('textbox', { name: 'mois de naissance' }), '12');
            await fillIn(screen.getByRole('textbox', { name: 'année de naissance' }), '2000');
            await click(screen.getByRole('button', { name: this.intl.t('pages.join.button') }));
            await click(screen.getByRole('button', { name: this.intl.t('pages.join.sco.associate') }));
            await fillIn(screen.getByRole('textbox', { name: 'nom de naissance de maman' }), 'truc');

            // when
            await click(screen.getByRole('button', { name: 'Continuer' }));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      module('When campaign has external id', function () {
        module('When participant external id is not set in the url', function () {
          test('should go to the tutorial when the user fill in his id', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });
            const screen = await startCampaignByCode(campaign.code);

            // when
            await fillIn(screen.getByRole('textbox', { name: 'nom de naissance de maman' }), 'truc');
            await click(screen.getByRole('button', { name: 'Continuer' }));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });

          test('should start the assessment when the user has seen tutorial', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });
            const screen = await startCampaignByCode(campaign.code);

            // when
            await fillIn(screen.getByRole('textbox', { name: 'nom de naissance de maman' }), 'truc');
            await click(screen.getByRole('button', { name: 'Continuer' }));
            await click(screen.getByRole('button', { name: this.intl.t('pages.tutorial.pass') }));

            // then
            assert.ok(currentURL().includes('/assessments/'));
          });
        });

        module('When participant external id exceeds 255 characters', function () {
          test('should redirect to fill in external participant id page', async function (assert) {
            // given & when
            const externalId256Characters =
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
            campaign = server.create('campaign', { isRestricted: false, idPixLabel: 'toto', type: ASSESSMENT });
            await startCampaignByCodeAndExternalId(campaign.code, externalId256Characters);

            // then
            assert.ok(currentURL().includes('/identifiant'));
          });
        });

        module('When participant external id is set in the url', function () {
          test('should redirect to assessment', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });

            // when
            await startCampaignByCodeAndExternalId(campaign.code);

            // then
            assert.ok(currentURL().includes('/didacticiel'));
          });

          test('should start the assessment when the user has seen tutorial', async function (assert) {
            // given
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman', type: ASSESSMENT });
            const screen = await startCampaignByCodeAndExternalId(campaign.code);

            // when
            await click(screen.getByRole('button', { name: this.intl.t('pages.tutorial.pass') }));

            // then
            assert.ok(currentURL().includes('/assessments/'));
          });
        });
      });

      module('When campaign does not have external id', function () {
        test('should redirect to tutorial after clicking on start button in landing page', async function (assert) {
          // given
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          const screen = await visit(`campagnes/${campaign.code}`);

          // when
          await click(screen.getByRole('button', { name: 'Je commence' }));

          // then
          assert.ok(currentURL().includes('/didacticiel'));
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should redirect to tutorial after clicking on start button in landing page', async function (assert) {
          // given
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT });
          const screen = await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);

          // when
          await click(screen.getByRole('button', { name: 'Je commence' }));

          // then
          assert.ok(currentURL().includes('/didacticiel'));
        });
      });

      module('When campaign does not have external id and is for absolute novice', function () {
        test('should redirect to assessment when starting a campaign', async function (assert) {
          // given & when
          campaign = server.create('campaign', { idPixLabel: null, type: ASSESSMENT, isForAbsoluteNovice: true });
          await visit(`campagnes/${campaign.code}`);

          // then
          assert.notOk(currentURL().includes('/didacticiel'));
          assert.ok(currentURL().includes('/assessments'));
        });
      });

      module('When the participation is shared', function () {
        module('when the campaign allows multiple participations', function () {
          test('should redirect to assessment when retrying the campaign', async function (assert) {
            // given
            campaign = server.create('campaign', { type: ASSESSMENT, multipleSendings: true });
            const assessment = server.create('assessment', {
              type: 'CAMPAIGN',
              state: 'completed',
              codeCampaign: campaign.code,
            });
            const campaignParticipationResult = server.create('campaign-participation-result', {});
            server.create('campaign-participation', {
              sharedAt: new Date('2020-01-01'),
              isShared: true,
              createdAt: new Date('2020-01-01'),
              assessment,
              campaign,
              campaignParticipationResult,
            });

            // when
            await visit(`campagnes/${campaign.code}?retry=true`);

            // then
            assert.ok(currentURL().includes('/evaluation'));
          });
        });

        module('when the campaign does not allow multiple participations', function () {
          test('should redirect to assessment results when retrying the campaign', async function (assert) {
            // given
            campaign = server.create('campaign', { type: ASSESSMENT, multipleSendings: false });
            const assessment = server.create('assessment', {
              type: 'CAMPAIGN',
              state: 'completed',
              codeCampaign: campaign.code,
            });
            const campaignParticipationResult = server.create('campaign-participation-result', {});
            server.create('campaign-participation', {
              sharedAt: new Date('2020-01-01'),
              isShared: true,
              createdAt: new Date('2020-01-01'),
              user: prescritUser,
              campaign,
              assessment,
              campaignParticipationResult,
            });

            // when
            await visit(`campagnes/${campaign.code}?retry=true&hasUserSeenLandingPage=true`);

            // then
            assert.ok(currentURL().includes('/evaluation/resultats'));
          });
        });
      });
    });
  });

  async function _fillInputsToCreateUserPixAccount({ prescritUser, screen, intl }) {
    await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), prescritUser.firstName);
    await fillIn(screen.getByRole('textbox', { name: 'Nom' }), prescritUser.lastName);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail (ex: nom@exemple.fr)' }), prescritUser.email);
    await fillIn(
      screen.getByLabelText('Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)'),
      prescritUser.password,
    );
    await click(screen.getByRole('checkbox', { name: intl.t('common.cgu.label') }));
    await click(screen.getByRole('button', { name: intl.t('pages.sign-up.actions.submit') }));
  }
});
