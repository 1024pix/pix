import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import OidcSignupOrLogin from 'mon-pix/components/authentication/oidc-signup-or-login';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication | oidc-signup-or-login', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  hooks.beforeEach(function () {
    for (const key of Object.keys(state)) delete state[key];
    state.identityProviderSlug = 'oidc-partner';

    const oidcPartner = {
      id: 'OIDC_PARTNER',
      code: 'OIDC_PARTNER',
      slug: 'oidc-partner',
      organizationName: 'Partenaire OIDC',
      shouldCloseSession: false,
      source: 'oidc-externe',
    };
    const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
    const storeStub = Service.create({
      findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
      peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
    });
    oidcIdentityProvidersService.set('store', storeStub);

    const userClaims = {
      firstName: 'Mélusine',
      lastName: 'TITEGOUTTE',
    };

    state.userClaims = userClaims;
  });

  test('should display heading', async function (assert) {
    // given & when
    const screen = await render(
      <template>
        <OidcSignupOrLogin @identityProviderSlug={{state.identityProviderSlug}} @userClaims={{state.userClaims}} />
      </template>,
    ); // then
    assert.ok(
      screen.getByRole('heading', {
        name: t('pages.oidc-signup-or-login.title'),
        level: 1,
      }),
    );
  });

  module('on register form', function () {
    module('when userClaims are found', function () {
      test('should display elements for OIDC identity provider', async function (assert) {
        // given & when
        const screen = await render(
          <template>
            <OidcSignupOrLogin @identityProviderSlug={{state.identityProviderSlug}} @userClaims={{state.userClaims}} />
          </template>,
        );

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: t('pages.oidc-signup-or-login.signup-form.title'),
            level: 2,
          }),
        );
        assert.ok(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));
        assert.ok(screen.getByText('Partenaire OIDC'));
        assert.ok(
          screen.getByText(
            t('pages.oidc-signup-or-login.signup-form.first-name-label-and-value', { firstName: 'Mélusine' }),
          ),
        );
        assert.ok(
          screen.getByText(
            t('pages.oidc-signup-or-login.signup-form.last-name-label-and-value', { lastName: 'TITEGOUTTE' }),
          ),
        );
        assert.ok(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        assert.ok(screen.getByRole('link', { name: t('common.cgu.cgu') }));
        assert.ok(screen.getByRole('link', { name: t('common.cgu.data-protection-policy') }));
      });
    });

    module('when userClaims are not found', function () {
      test('diplays an error and no register form', async function (assert) {
        // given & when
        const screen = await render(
          <template>
            <OidcSignupOrLogin @identityProviderSlug={{state.identityProviderSlug}} @userClaims={{null}} />
          </template>,
        );

        // then
        assert.ok(
          screen.getByRole('heading', {
            name: t('pages.oidc-signup-or-login.signup-form.title'),
            level: 2,
          }),
        );
        assert.ok(screen.getByText(t('pages.oidc-signup-or-login.signup-form.error')));
        assert.notOk(screen.queryByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));
        assert.notOk(screen.queryByText('Partenaire OIDC'));
        assert.notOk(
          screen.queryByText(
            t('pages.oidc-signup-or-login.signup-form.first-name-label-and-value', { firstName: 'Mélusine' }),
          ),
        );
        assert.notOk(
          screen.queryByText(
            t('pages.oidc-signup-or-login.signup-form.last-name-label-and-value', { lastName: 'TITEGOUTTE' }),
          ),
        );
        assert.notOk(screen.queryByRole('checkbox', { name: t('common.cgu.label') }));
        assert.notOk(screen.queryByRole('link', { name: t('common.cgu.cgu') }));
        assert.notOk(screen.queryByRole('link', { name: t('common.cgu.data-protection-policy') }));
      });
    });
  });

  module('on login form', function () {
    test('displays some form elements', async function (assert) {
      // given & when
      const screen = await render(
        <template>
          <OidcSignupOrLogin @identityProviderSlug={{state.identityProviderSlug}} @userClaims={{null}} />
        </template>,
      ); // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.oidc-signup-or-login.login-form.title'),
          level: 2,
        }),
      );
      assert.ok(screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }));
      assert.ok(screen.getByRole('link', { name: t('pages.sign-in.forgotten-password') }));
      assert.ok(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));
    });
  });

  module('when registering', function () {
    module('when terms of service are accepted and registration succeeds', function () {
      test('creates a session through the OIDC authenticator', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        state.authenticationKey = 'super-key';

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oidc', {
          authenticationKey: 'super-key',
          identityProviderSlug: 'oidc-partner',
          hostSlug: 'users',
        });
        assert.ok(true);
      });
    });

    module('when terms of service are not accepted', function () {
      test('displays an error and does not create a session', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        assert.ok(await screen.findByText(t('pages.oidc-signup-or-login.error.error-message')));
        sinon.assert.notCalled(sessionService.authenticate);
      });
    });

    module('when authentication key has expired', function () {
      test('displays an error', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        assert.ok(await screen.findByText(t('pages.oidc-signup-or-login.error.expired-authentication-key')));
      });
    });

    module('when user account is temporarily blocked', function () {
      test('displays an error', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({
          errors: [{ status: '403', code: 'USER_IS_TEMPORARY_BLOCKED', meta: { blockingDurationMs: 60000 } }],
        });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        assert.ok(
          await screen.findByText(/votre compte Pix est bloqué temporairement pendant 1 minutes/, { exact: false }),
        );
      });
    });

    module('when user account is blocked', function () {
      test('displays an error', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '403', code: 'USER_IS_BLOCKED' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        assert.ok(await screen.findByText(/Votre compte est bloqué/, { exact: false }));
      });
    });

    module('when an unexpected error occurs', function () {
      test('displays a default error message without the error details', async function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '500', detail: 'some detail' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @authenticationKey={{state.authenticationKey}}
              @userClaims={{state.userClaims}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.signup-form.button') }));

        // then
        assert.ok(await screen.findByText(/Impossible de se connecter/, { exact: false }));
        assert.notOk(screen.queryByText('some detail'));
      });
    });
  });

  module('when validating the login email', function () {
    test('trims the email value', async function (assert) {
      // given
      const onLogin = sinon.stub().resolves();

      const screen = await render(
        <template>
          <OidcSignupOrLogin
            @identityProviderSlug={{state.identityProviderSlug}}
            @userClaims={{null}}
            @onLogin={{onLogin}}
          />
        </template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
        '   glace@aleau.net   ',
      );
      await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
      await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

      // then
      sinon.assert.calledWith(onLogin, {
        enteredEmail: 'glace@aleau.net',
        enteredPassword: 'pix123',
      });
      assert.ok(true);
    });

    module('when email is invalid', function () {
      test('displays an error', async function (assert) {
        // given
        const screen = await render(
          <template>
            <OidcSignupOrLogin @identityProviderSlug={{state.identityProviderSlug}} @userClaims={{null}} />
          </template>,
        );

        // when
        await fillIn(
          screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
          'glace@aleau',
        );

        // then
        assert.ok(await screen.findByText(t('pages.oidc-signup-or-login.error.invalid-email')));
      });
    });
  });

  module('when logging in', function () {
    test('retrieves the existing pix account through the entered credentials', async function (assert) {
      // given
      const onLogin = sinon.stub().resolves();

      const screen = await render(
        <template>
          <OidcSignupOrLogin
            @identityProviderSlug={{state.identityProviderSlug}}
            @userClaims={{null}}
            @onLogin={{onLogin}}
          />
        </template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
        'glace.alo@example.net',
      );
      await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
      await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

      // then
      sinon.assert.calledWith(onLogin, {
        enteredEmail: 'glace.alo@example.net',
        enteredPassword: 'pix123',
      });
      assert.ok(true);
    });

    module('when the form is invalid', function () {
      test('does not request the api for reconciliation', async function (assert) {
        // given
        const onLogin = sinon.stub().resolves();

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @userClaims={{null}}
              @onLogin={{onLogin}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

        // then
        sinon.assert.notCalled(onLogin);
        assert.ok(true);
      });
    });

    module('when authentication key has expired', function () {
      test('displays an error', async function (assert) {
        // given
        const onLogin = sinon.stub().rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @userClaims={{null}}
              @onLogin={{onLogin}}
            />
          </template>,
        );

        // when
        await fillIn(
          screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
          'glace.alo@example.net',
        );
        await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

        // then
        assert.ok(await screen.findByText(t('pages.oidc-signup-or-login.error.expired-authentication-key')));
      });
    });

    module('when there is an account conflict', function () {
      test('displays an error', async function (assert) {
        // given
        const onLogin = sinon.stub().rejects({ errors: [{ status: '409' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @userClaims={{null}}
              @onLogin={{onLogin}}
            />
          </template>,
        );

        // when
        await fillIn(
          screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
          'glace.alo@example.net',
        );
        await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

        // then
        assert.ok(await screen.findByText(t('pages.oidc-signup-or-login.error.account-conflict')));
      });
    });

    module('when an unexpected error occurs', function () {
      test('displays a default error message', async function (assert) {
        // given
        const onLogin = sinon.stub().rejects({ errors: [{ status: '500' }] });

        const screen = await render(
          <template>
            <OidcSignupOrLogin
              @identityProviderSlug={{state.identityProviderSlug}}
              @userClaims={{null}}
              @onLogin={{onLogin}}
            />
          </template>,
        );

        // when
        await fillIn(
          screen.getByRole('textbox', { name: t('pages.oidc-signup-or-login.login-form.email') }),
          'glace.alo@example.net',
        );
        await fillIn(screen.getByLabelText(t('pages.oidc-signup-or-login.login-form.password')), 'pix123');
        await click(screen.getByRole('button', { name: t('pages.oidc-signup-or-login.login-form.button') }));

        // then
        assert.ok(await screen.findByText(/Impossible de se connecter/, { exact: false }));
      });
    });
  });
});
