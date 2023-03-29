import { module, test } from 'qunit';

import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { clickByLabel } from '../helpers/click-by-label';
import { fillInByLabel } from '../helpers/fill-in-by-label';
import { authenticate, authenticateByGAR } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import { currentSession } from 'ember-simple-auth/test-support';
import ENV from 'mon-pix/config/environment';
import setupIntl from '../helpers/setup-intl';
import { t } from 'ember-intl/test-support';
import { visit } from '@1024pix/ember-testing-library';

const AUTHENTICATED_SOURCE_FROM_GAR = ENV.APP.AUTHENTICATED_SOURCE_FROM_GAR;

module('Acceptance | Campaigns | Start Campaigns workflow', function (hooks) {
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
      module('When user has not given any campaign code', function () {
        test('should access campaign form page', async function (assert) {
          // when
          await visit('/campagnes');

          // then
          assert.ok(
            find('.fill-in-campaign-code__start-button').textContent.includes(t('pages.fill-in-campaign-code.start'))
          );
        });
      });

      module('When campaign code exists', function () {
        module('When campaign is not restricted', function () {
          test('should display landing page', async function (assert) {
            // given
            const campaign = server.create('campaign', { isRestricted: false });
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          module('When user create its account', function () {
            test('should send campaignCode to API', async function (assert) {
              let sentCampaignCode;

              const prescritUser = {
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'firstName.lastName@email.com',
                password: 'Pix12345',
              };

              this.server.post(
                '/users',
                (schema, request) => {
                  sentCampaignCode = JSON.parse(request.requestBody).meta['campaign-code'];
                  return schema.users.create({});
                },
                201
              );

              // given
              const campaign = server.create('campaign', { isRestricted: false });
              const screen = await visit('/campagnes');
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);

              // when
              await click('.campaign-landing-page__start-button');

              // then
              assert.strictEqual(currentURL(), '/inscription');

              // when
              await fillIn('#firstName', prescritUser.firstName);
              await fillIn('#lastName', prescritUser.lastName);
              await fillIn('#email', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

              // when
              await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));

              // then
              assert.strictEqual(sentCampaignCode, campaign.code);
            });
          });
        });

        module('When campaign is restricted and SCO', function (hooks) {
          hooks.beforeEach(function () {
            campaign = server.create('campaign', { isRestricted: true, organizationType: 'SCO' });
          });

          module('When the student has an account but is not reconciled', function () {
            test('should redirect to invited sco student page', async function (assert) {
              // given
              await visit('/campagnes');

              // when
              await fillIn('#campaign-code', campaign.code);
              await clickByLabel(t('pages.fill-in-campaign-code.start'));
              await clickByLabel('Je commence');
              await click('#login-button');
              await fillIn('#login', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#submit-connexion');

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/eleve`);
            });

            module('When student is reconciled in another organization', function () {
              test('should reconcile and begin campaign participation', async function (assert) {
                // given
                server.get('sco-organization-learners', () => {
                  return { data: null };
                });
                server.create('sco-organization-learner', {
                  campaignCode: campaign.code,
                });
                await visit('/campagnes');

                // when
                await fillIn('#campaign-code', campaign.code);
                await clickByLabel(t('pages.fill-in-campaign-code.start'));
                await clickByLabel('Je commence');
                await click('#login-button');
                await fillIn('#login', prescritUser.email);
                await fillIn('#password', prescritUser.password);
                await click('#submit-connexion');

                // then
                assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
              });
            });
          });

          module('When user must accept Pix last terms of service', function () {
            test('should redirect to invited sco student page after accept terms of service', async function (assert) {
              // given
              await visit('/campagnes');
              prescritUser.mustValidateTermsOfService = true;
              await fillIn('#campaign-code', campaign.code);
              await clickByLabel(t('pages.fill-in-campaign-code.start'));
              await clickByLabel('Je commence');
              await click('#login-button');
              await fillIn('#login', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#submit-connexion');

              // when
              await click('#pix-cgu');
              await clickByLabel(this.intl.t('pages.terms-of-service.form.button'));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/eleve`);
            });
          });

          test('should redirect to landing-page page', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to login-or-register page when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            // when
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/identification`);
          });

          test('should not alter inputs(username,password,email) when email already exists', async function (assert) {
            //given
            this.server.put('sco-organization-learners/possibilities', () => {
              const studentFoundWithUsernameGenerated = {
                data: {
                  attributes: {
                    'last-name': 'last',
                    'first-name': 'first',
                    birthdate: '2010-10-10',
                    'campaign-code': 'RESTRICTD',
                    username: 'first.last1010',
                  },
                  type: 'sco-organization-learners',
                },
              };
              return new Response(200, {}, studentFoundWithUsernameGenerated);
            });

            this.server.post('sco-organization-learners/dependent', () => {
              const emailAlreadyExistResponse = {
                errors: [
                  {
                    status: '422',
                    title: 'Invalid data attribute "email"',
                    detail: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
                    source: { pointer: '/data/attributes/email' },
                  },
                ],
              };

              return new Response(422, {}, emailAlreadyExistResponse);
            });

            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            // when
            await fillIn('#firstName', prescritUser.firstName);
            await fillIn('#lastName', prescritUser.lastName);
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('#submit-search');
            //go to email-based authentication window
            await click('.pix-toggle-deprecated__off');

            await fillIn('#email', prescritUser.email);
            await fillIn('#password', 'pix123');
            await click('#submit-registration');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/identification`);
            assert.strictEqual(find('#firstName').value, prescritUser.firstName);
            assert.strictEqual(find('#email').value, prescritUser.email);
            assert.strictEqual(find('#password').value, 'pix123');

            //go to username-based authentication window
            await click('.pix-toggle-deprecated__off');
            assert.strictEqual(find('span[data-test-username]').textContent, 'first.last1010');
            assert.strictEqual(find('#password').value, 'pix123');
          });

          test('should redirect to student sco invited page when connection is done', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/identification`);

            // when
            await click('#login-button');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/eleve`);
          });

          test('should begin campaign participation when fields are filled in and associate button is clicked', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/identification`);

            // when
            await click('#login-button');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/eleve`);

            // when
            await fillIn('#firstName', 'Jane');
            await fillIn('#lastName', 'Acme');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.associate'));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });

        module('When campaign is restricted and SUP', function (hooks) {
          hooks.beforeEach(function () {
            campaign = server.create('campaign', { isRestricted: true, organizationType: 'SUP' });
          });

          test('should redirect to landing page', async function (assert) {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to simple login page when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            // when
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), '/inscription');
          });

          test('should redirect to invited sup student page after login', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            // when
            await clickByLabel('connectez-vous à votre compte');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);

            await clickByLabel('Je me connecte');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/etudiant`);
          });
        });

        module('When is a simplified access campaign', function (hooks) {
          hooks.beforeEach(function () {
            campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
          });

          test('should redirect to landing page', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to tutorial page after starting campaign', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);
            await click('button[type="submit"]');
            await fillIn('#id-pix-label', 'vu');
            await click('button[type="submit"]');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      module('When campaign code does not exist', function () {
        test('should display an error message on fill-in-campaign-code page', async function (assert) {
          // given
          const campaignCode = 'NONEXIST';
          await visit('/campagnes');

          // when
          await fillIn('#campaign-code', campaignCode);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.ok(
            find('.fill-in-campaign-code__error').textContent.includes(
              t('pages.fill-in-campaign-code.errors.not-found')
            )
          );
        });
      });

      module('When user validates with empty campaign code', function () {
        test('should display an error', async function (assert) {
          // given
          await visit('/campagnes');

          // when
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.ok(find('.fill-in-campaign-code__error').textContent.includes('Veuillez saisir un code.'));
        });
      });

      module('When the user has already seen the landing page', function () {
        test('should redirect to signin page', async function (assert) {
          // given & when
          const campaign = server.create('campaign');
          await startCampaignByCode(campaign.code);

          // then
          assert.strictEqual(currentURL(), '/inscription');
        });
      });

      module('When the user has not seen the landing page', function () {
        test('should redirect to landing page', async function (assert) {
          // when
          const campaign = server.create('campaign');
          await visit(`/campagnes/${campaign.code}`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });

        module('When campaign has custom text for the landing page', function () {
          test('should show the custom text on the landing page', async function (assert) {
            // given
            const campaign = server.create('campaign', { customLandingPageText: 'SomeText' });

            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            assert.dom('.campaign-landing-page__start__custom-text').exists();
            assert.ok(
              find('.campaign-landing-page__start__custom-text').textContent.includes(campaign.customLandingPageText)
            );
          });
        });

        module('When campaign does not have custom text for the landing page', function () {
          test('should show only the defaulted text on the landing page', async function (assert) {
            // when
            const campaign = server.create('campaign', { customLandingPageText: null });
            await visit(`/campagnes/${campaign.code}`);

            // then
            assert.dom('.campaign-landing-page__start__custom-text').doesNotExist();
          });
        });
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticate(prescritUser);
      });

      module('When campaign is not restricted', function () {
        test('should redirect to landing page', async function (assert) {
          // given
          campaign = server.create('campaign');

          // when
          await visit(`/campagnes/${campaign.code}`);

          //then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });
      });

      module('When campaign is restricted and SCO', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { isRestricted: true, organizationType: 'SCO' });
        });

        module('When association is not already done', function () {
          test('should redirect to landing page', async function (assert) {
            // given
            await visit('/campagnes');

            //when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should try to reconcile automatically before redirect to invited sco student page', async function (assert) {
            // given
            server.get('sco-organization-learners', () => {
              return { data: null };
            });
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
            });

            // when
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });

          test('should redirect to invited sco student page when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            //when
            await clickByLabel('Je commence');

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/eleve`);
          });

          test('should not set any field by default', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');

            //then
            assert.strictEqual(find('#firstName').value, '');
            assert.strictEqual(find('#lastName').value, '');
          });

          test('should begin campaign participation when fields are filled in and associate button is clicked', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel('Je commence');
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            // when
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.associate'));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });

        module('When association is already done', function (hooks) {
          hooks.beforeEach(function () {
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
            });
          });

          test('should redirect to landing page', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should begin campaign participation when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            // when
            await clickByLabel('Je commence');

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      module('When campaign is restricted and SUP', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { isRestricted: true, organizationType: 'SUP' });
        });

        test('should redirect to landing page', async function (assert) {
          // given
          await visit('/campagnes');

          //when
          await fillIn('#campaign-code', campaign.code);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          //then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });

        test('should redirect to invited sup student page when landing page has been seen', async function (assert) {
          // given
          await visit(`/campagnes/${campaign.code}`);

          // when
          await clickByLabel('Je commence');

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/etudiant`);
        });

        test('should begin campaign participation when association is done', async function (assert) {
          // given
          await visit(`/campagnes/${campaign.code}`);
          await clickByLabel('Je commence');

          // when
          await fillInByLabel('Numéro étudiant', 'F100');
          await fillInByLabel('Prénom', 'Jean');
          await fillInByLabel('Nom', 'Bon');
          await fillInByLabel('jour de naissance', '01');
          await fillInByLabel('mois de naissance', '01');
          await fillInByLabel('année de naissance', '2000');
          await clickByLabel("C'est parti !");

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
        });
      });

      module('When campaign has external id', function () {
        module('When participant external id is not set in the url', function () {
          test('should show the identifiant page after clicking on start button in landing page', async function (assert) {
            // given & when
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCode(campaign.code);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/prescrit/identifiant`);
          });
        });

        module('When participant external id is set in the url', function () {
          test('should begin campaign participation', async function (assert) {
            // given & when
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCodeAndExternalId(campaign.code);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      module('When campaign does not have external id', function () {
        test('should begin campaign participation', async function (assert) {
          // given & when
          campaign = server.create('campaign', { idPixLabel: null });
          await startCampaignByCode(campaign.code);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
        });
      });

      module('When campaign does not have external id but a participant external id is set in the url', function () {
        test('should begin campaign participation', async function (assert) {
          // given & when
          campaign = server.create('campaign', { idPixLabel: null });
          await startCampaignByCodeAndExternalId(campaign.code);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
        });
      });

      module('When the campaign is restricted and organization learner is disabled', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true });
        });

        test('should redirect to landing page', async function (assert) {
          // when
          await visit(`/campagnes/${campaign.code}`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });

        test('should show an error message when user starts the campaign', async function (assert) {
          // when
          const screen = await visit(`/campagnes/${campaign.code}`);
          await clickByLabel('Je commence');

          // then
          assert.ok(screen.getByText('Oups, la page demandée n’est pas accessible.'));
        });
      });

      module('When campaign does not exist', function (hooks) {
        hooks.beforeEach(async function () {
          await visit('/campagnes/codefaux');
        });

        test('should show an error message', async function (assert) {
          // then
          assert.strictEqual(currentURL(), '/campagnes/codefaux');
          assert.ok(find('.title').textContent.includes('Oups, la page demandée n’est pas accessible.'));
        });
      });

      module('When is a simplified access campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
        });

        test('should redirect to landing page', async function (assert) {
          // when
          await visit(`/campagnes/${campaign.code}`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });

        test('should redirect to tutorial page after starting campaign', async function (assert) {
          // when
          await visit(`/campagnes/${campaign.code}`);
          await click('button[type="submit"]');
          await fillIn('#id-pix-label', 'vu');
          await click('button[type="submit"]');

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
        });
      });
    });

    module('When user is logged as anonymous and campaign is simplified access', function () {
      test('should replace previous connected anonymous user', async function (assert) {
        // given
        campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
        await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });
        const session = currentSession();
        const previousUserId = session.data.authenticated['user_id'];

        // when
        await visit('/campagnes');
        await fillIn('#campaign-code', campaign.code);
        await clickByLabel(t('pages.fill-in-campaign-code.start'));
        await click('button[type="submit"]');

        const currentUserId = session.data.authenticated['user_id'];

        // then
        assert.true(Number.isFinite(currentUserId));
        assert.notEqual(previousUserId, currentUserId);
      });
    });

    module('When user is logged in an external platform', function () {
      module('When campaign is restricted and SCO', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { isRestricted: true, organizationType: 'SCO' });
        });

        module('When association is not already done and reconciliation token is provided', function (hooks) {
          hooks.beforeEach(async function () {
            const externalUserToken =
              'aaa.' +
              btoa(
                '{"first_name":"JeanPrescrit","last_name":"Campagne","saml_id":"SamlId","source":"external","iat":1545321469,"exp":4702193958}'
              ) +
              '.bbb';
            await visit(`/campagnes?externalUser=${externalUserToken}`);
          });

          test('should redirect to landing page', async function (assert) {
            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to reconciliation form when landing page has been seen', async function (assert) {
            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/rejoindre/mediacentre`);
          });

          test('should set by default firstName and lastName', async function (assert) {
            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            //then
            assert.strictEqual(find('#firstName').value, 'JeanPrescrit');
            assert.strictEqual(find('#lastName').value, 'Campagne');
          });

          test('should begin campaign participation when reconciliation is done', async function (assert) {
            // given
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            // when
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });

        module('When association is already done and user is created', function (hooks) {
          let garUser;

          hooks.beforeEach(async function () {
            garUser = server.create('user', AUTHENTICATED_SOURCE_FROM_GAR);
            await authenticateByGAR(garUser);
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
            });
          });

          test('should redirect to landing page', async function (assert) {
            // when
            await visit(`/campagnes/${campaign.code}`);

            //then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          module('When user is already reconciled in another organization', function () {
            test('should reconcile and redirect to landing-page', async function (assert) {
              // given
              server.get('sco-organization-learners', () => {
                return { data: null };
              });
              server.create('sco-organization-learner', {
                campaignCode: campaign.code,
              });
              await visit('/campagnes');

              // when
              await fillIn('#campaign-code', campaign.code);
              await clickByLabel(t('pages.fill-in-campaign-code.start'));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
            });
          });
        });

        module('When user is already reconciled and has no GAR authentication method yet', function (hooks) {
          const externalUserToken =
            'aaa.' +
            btoa(
              '{"first_name":"JeanPrescrit","last_name":"Campagne","saml_id":"SamlId","source":"external","iat":1545321469,"exp":4702193958}'
            ) +
            '.bbb';

          hooks.beforeEach(async function () {
            server.post('/sco-organization-learners/external', async function () {
              return new Response(
                409,
                {},
                {
                  errors: [
                    {
                      status: '409',
                      code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
                      title: 'Conflict',
                      detail: "Un compte existe déjà pour l'élève dans le même établissement.",
                      meta: {
                        shortCode: 'R31',
                        value: 'u***@example.net',
                        userId: 1,
                      },
                    },
                  ],
                }
              );
            });

            await visit(`/campagnes?externalUser=${externalUserToken}`);
          });

          test('should begin campaign participation if GAR authentication method has been added', async function (assert) {
            // given
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
            });
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            const session = currentSession();
            assert.strictEqual(session.data.authenticated.source, AUTHENTICATED_SOURCE_FROM_GAR);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });

          test('should display an specific error message if GAR authentication method adding has failed with http statusCode 4xx', async function (assert) {
            // given
            const expectedErrorMessage = 'Les données que vous avez soumises ne sont pas au bon format.';
            const errorsApi = new Response(
              400,
              {},
              {
                errors: [{ status: 400 }],
              }
            );
            server.post('/token-from-external-user', () => errorsApi);

            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            assert.ok(currentURL().includes(`/campagnes/${campaign.code}/rejoindre/identification`));
            assert.strictEqual(find('#update-form-error-message').textContent, expectedErrorMessage);
          });

          test('should display an specific error message if GAR authentication method adding has failed due to wrong connected account', async function (assert) {
            // given
            const expectedErrorMessage =
              "L'adresse e-mail ou l'identifiant est incorrect. Pour continuer, vous devez vous connecter à votre compte qui est sous la forme : ";
            const expectedObfuscatedConnectionMethod = 't***@example.net';
            const errorsApi = new Response(
              409,
              {},
              {
                errors: [
                  {
                    status: 409,
                    code: 'UNEXPECTED_USER_ACCOUNT',
                    meta: { value: expectedObfuscatedConnectionMethod },
                  },
                ],
              }
            );
            server.post('/token-from-external-user', () => errorsApi);

            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            assert.ok(currentURL().includes(`/campagnes/${campaign.code}/rejoindre/identification`));
            assert.strictEqual(
              find('#update-form-error-message').textContent,
              expectedErrorMessage + expectedObfuscatedConnectionMethod
            );
          });

          test('should display the default error message if GAR authentication method adding has failed with others http statusCode', async function (assert) {
            // given
            const expectedErrorMessage =
              'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';
            server.post('/token-from-external-user', () => new Response(500));

            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));
            await clickByLabel('Je commence');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            assert.ok(currentURL().includes(`/campagnes/${campaign.code}/rejoindre/identification`));
            assert.strictEqual(find('#update-form-error-message').textContent, expectedErrorMessage);
          });

          module('When user should change password', function () {
            test('should begin campaign participation after updating password expired', async function (assert) {
              // given
              const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');

              server.post('/sco-organization-learners/external', async function () {
                return new Response(
                  409,
                  {},
                  {
                    errors: [
                      {
                        status: '409',
                        code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
                        title: 'Conflict',
                        detail: "Un compte existe déjà pour l'élève dans le même établissement.",
                        meta: {
                          shortCode: 'R32',
                          value: 'u***.y***1989',
                          userId: 1,
                        },
                      },
                    ],
                  }
                );
              });

              server.create('sco-organization-learner', {
                campaignCode: campaign.code,
              });

              // when
              await fillIn('#campaign-code', campaign.code);
              await clickByLabel(t('pages.fill-in-campaign-code.start'));
              await clickByLabel('Je commence');

              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));
              await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));
              await fillIn('#login', userShouldChangePassword.username);
              await fillIn('#password', userShouldChangePassword.password);
              await click('#submit-connexion');

              // then
              assert.strictEqual(currentURL(), '/mise-a-jour-mot-de-passe-expire');

              // when
              await fillIn('#password', 'newPass12345!');
              await clickByLabel(this.intl.t('pages.update-expired-password.button'));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
            });
          });
        });
      });
    });
  });
});
