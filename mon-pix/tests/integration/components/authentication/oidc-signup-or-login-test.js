import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication | oidc-signup-or-login', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('identityProviderSlug', 'oidc-partner');

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

    this.set('userClaims', userClaims);
  });

  test('should display heading', async function (assert) {
    // given & when
    const screen = await render(
      hbs`<Authentication::OidcSignupOrLogin
  @identityProviderSlug={{this.identityProviderSlug}}
  @userClaims={{this.userClaims}}
/>`,
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
          hbs`<Authentication::OidcSignupOrLogin
  @identityProviderSlug={{this.identityProviderSlug}}
  @userClaims={{this.userClaims}}
/>`,
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
          hbs`<Authentication::OidcSignupOrLogin @identityProviderSlug={{this.identityProviderSlug}} @userClaims={{null}} />`,
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
        hbs`<Authentication::OidcSignupOrLogin @identityProviderSlug={{this.identityProviderSlug}} @userClaims={{null}} />`,
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
});
