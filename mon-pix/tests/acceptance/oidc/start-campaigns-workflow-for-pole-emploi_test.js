/* eslint ember/no-classic-classes: 0 */

import { module, test } from 'qunit';

import { fillIn, currentURL, find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';

import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';
import Service from '@ember/service';

import { authenticateByEmail } from '../../helpers/authentication';
import { currentSession } from 'ember-simple-auth/test-support';
import setupIntl from '../../helpers/setup-intl';
import { t } from 'ember-intl/test-support';

module('Acceptance | Campaigns | Start Campaigns workflow | Pôle Emploi', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let campaign;

  module('Start a campaign', function () {
    module('When user is not logged in', function () {
      module('When campaign code exists', function () {
        module('When campaign belongs to Pole Emploi organization', function () {
          let replaceLocationStub;

          hooks.beforeEach(function (hooks) {
            replaceLocationStub = sinon.stub().resolves();
            this.owner.register(
              'service:location',
              Service.extend({
                replace: replaceLocationStub,
              })
            );
            campaign = server.create('campaign', { identityProvider: 'POLE_EMPLOI' });
          });

          test('should redirect to landing page', async function (assert) {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // then
            assert.equal(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to Pole Emploi authentication form when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            // when
            await clickByLabel('Je commence');

            // then
            sinon.assert.called(replaceLocationStub);
            assert.equal(currentURL(), '/connexion/pole-emploi');
          });

          test('should redirect to terms of service Pole Emploi page', async function (assert) {
            // given
            const state = 'state';
            const session = currentSession();
            session.set('data.state', state);
            this.server.post('pole-emploi/token', function () {
              return new Response(
                401,
                {},
                {
                  errors: [
                    {
                      code: 'SHOULD_VALIDATE_CGU',
                      meta: {
                        authenticationKey: 'key',
                      },
                    },
                  ],
                }
              );
            });

            // when
            await visit(`/connexion/pole-emploi?code=test&state=${state}`);

            // then
            assert.equal(currentURL(), `/cgu-oidc?authenticationKey=key&identityProviderSlug=pole-emploi`);
            assert
              .dom(find('.terms-of-service-form__conditions').textContent)
              .hasText("J'accepte les conditions d'utilisation et la politique de confidentialité de Pix");
          });

          test('should begin campaign participation once user has accepted terms of service', async function (assert) {
            // given
            const state = 'state';
            const session = currentSession();
            session.set('data.state', state);
            session.set('data.nextURL', `/campagnes/${campaign.code}/acces`);
            const data = {};
            data[campaign.code] = { landingPageShown: true };
            sessionStorage.setItem('campaigns', JSON.stringify(data));

            // when
            await visit(`/cgu-oidc?authenticationKey=key&identityProviderSlug=pole-emploi`);
            await clickByLabel("J'accepte les conditions d'utilisation et la politique de confidentialité de Pix");
            await clickByLabel('Je continue');

            // then
            assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        const prescritUser = server.create('user', 'withEmail', {
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt: null,
        });
        await authenticateByEmail(prescritUser);
      });

      module('When campaign belongs to Pole Emploi organization', function (hooks) {
        let replaceLocationStub;

        hooks.beforeEach(function () {
          replaceLocationStub = sinon.stub().resolves();
          this.owner.register(
            'service:location',
            Service.extend({
              replace: replaceLocationStub,
            })
          );
          campaign = server.create('campaign', { identityProvider: 'POLE_EMPLOI' });
        });

        module('When user is logged in with Pole emploi', function (hooks) {
          hooks.beforeEach(function () {
            const session = currentSession();
            session.set('data.authenticated.identity_provider_code', 'POLE_EMPLOI');
          });

          test('should redirect to landing page', async function (assert) {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // then
            assert.equal(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should begin campaign participation', async function (assert) {
            // given
            await visit('/campagnes');
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // when
            await clickByLabel('Je commence');

            // then
            assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });

        module('When user is logged in with another authentication method', function () {
          test('should redirect to landing page', async function (assert) {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await clickByLabel(t('pages.fill-in-campaign-code.start'));

            // then
            assert.equal(currentURL(), `/campagnes/${campaign.code}/presentation`);
          });

          test('should redirect to Pole Emploi authentication form when landing page has been seen', async function (assert) {
            // given
            await visit(`/campagnes/${campaign.code}`);

            // when
            await clickByLabel('Je commence');

            // then
            sinon.assert.called(replaceLocationStub);
            assert.equal(currentURL(), '/connexion/pole-emploi');
          });

          test('should begin campaign participation once user is authenticated', async function (assert) {
            // given
            const state = 'state';

            const session = currentSession();
            session.set('isAuthenticated', true);
            session.set('data.state', state);
            session.set('data.nextURL', `/campagnes/${campaign.code}/acces`);
            const data = {};
            data[campaign.code] = { landingPageShown: true };
            sessionStorage.setItem('campaigns', JSON.stringify(data));

            // when
            await visit(`/connexion/pole-emploi?code=test&state=${state}`);

            // then
            sinon.assert.notCalled(replaceLocationStub);
            assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });
    });
  });
});
