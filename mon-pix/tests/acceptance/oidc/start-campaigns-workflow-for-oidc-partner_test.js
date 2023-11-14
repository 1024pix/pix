/* eslint ember/no-classic-classes: 0 */

import { module, test } from 'qunit';

import { fillIn, currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';
import Service from '@ember/service';

import { authenticateByEmail } from '../../helpers/authentication';
import { currentSession } from 'ember-simple-auth/test-support';
import setupIntl from '../../helpers/setup-intl';
import { t } from 'ember-intl/test-support';

module('Acceptance | Campaigns | Start Campaigns workflow | OIDC', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let campaign;

  module('Start a campaign that belongs to an external provider', function () {
    module('When user is not logged in', function (hooks) {
      let replaceLocationStub;

      hooks.beforeEach(function () {
        replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          Service.extend({
            replace: replaceLocationStub,
          }),
        );
        campaign = server.create('campaign', { identityProvider: 'OIDC_PARTNER' });
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

      test('should redirect to an oidc authentication form when landing page has been seen', async function (assert) {
        // given
        await visit(`/campagnes/${campaign.code}`);

        // when
        await clickByLabel('Je commence');

        // then
        sinon.assert.called(replaceLocationStub);
        assert.strictEqual(currentURL(), '/connexion/oidc-partner');
        assert.ok(true);
      });

      test('should redirect to login or register oidc page', async function (assert) {
        // given
        const state = 'state';
        const session = currentSession();
        session.set('data.state', state);
        this.server.post('oidc/token', () => {
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
            },
          );
        });

        // when
        const screen = await visit(`/connexion/oidc-partner?code=test&state=${state}`);

        // then
        assert.strictEqual(currentURL(), `/connexion/oidc?authenticationKey=key&identityProviderSlug=oidc-partner`);
        assert.ok(screen.getByRole('heading', { name: this.intl.t('pages.login-or-register-oidc.title') }));
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
        const screen = await visit(`/connexion/oidc?authenticationKey=key&identityProviderSlug=oidc-partner`);
        await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: 'Je crée mon compte' }));

        // then
        assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
      });
    });

    module('When user is logged in', function (hooks) {
      let replaceLocationStub;

      hooks.beforeEach(async function () {
        const prescritUser = server.create('user', 'withEmail', {
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt: null,
        });
        await authenticateByEmail(prescritUser);
        replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          Service.extend({
            replace: replaceLocationStub,
          }),
        );
        campaign = server.create('campaign', { identityProvider: 'OIDC_PARTNER' });
      });

      module('When user is logged in with an oidc organization', function (hooks) {
        hooks.beforeEach(function () {
          const session = currentSession();
          session.set('data.authenticated.identityProviderCode', 'OIDC_PARTNER');
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

        test('should begin campaign participation', async function (assert) {
          // given
          await visit('/campagnes');
          await fillIn('#campaign-code', campaign.code);
          await clickByLabel(t('pages.fill-in-campaign-code.start'));

          // when
          await clickByLabel('Je commence');

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
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
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });

        test('should redirect to oidc authentication form when landing page has been seen', async function (assert) {
          // given
          await visit(`/campagnes/${campaign.code}`);

          // when
          await clickByLabel('Je commence');

          // then
          sinon.assert.called(replaceLocationStub);
          assert.strictEqual(currentURL(), '/connexion/oidc-partner');
          assert.ok(true);
        });
      });
    });
  });
});
