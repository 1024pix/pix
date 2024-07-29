import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication | login-or-register-oidc', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('identityProviderSlug', 'oidc-partner');

    const oidcPartner = {
      id: 'oidc-partner',
      code: 'OIDC_PARTNER',
      organizationName: 'Partenaire OIDC',
      shouldCloseSession: false,
      source: 'oidc-externe',
    };
    class OidcIdentityProvidersStub extends Service {
      'oidc-partner' = oidcPartner;
      list = [oidcPartner];
    }
    this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);

    this.set('givenName', 'Mélusine');
    this.set('familyName', 'TITEGOUTTE');
  });

  test('should display heading', async function (assert) {
    // given & when
    const screen = await render(
      hbs`<Authentication::LoginOrRegisterOidc @identityProviderSlug={{this.identityProviderSlug}} />`,
    );

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: this.intl.t('pages.login-or-register-oidc.title'),
        level: 1,
      }),
    );
  });

  module('on register form', function () {
    test('should display elements for OIDC identity provider', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Authentication::LoginOrRegisterOidc
  @identityProviderSlug={{this.identityProviderSlug}}
  @givenName={{this.givenName}}
  @familyName={{this.familyName}}
/>`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.login-or-register-oidc.register-form.title'),
          level: 2,
        }),
      );
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.login-or-register-oidc.register-form.button') }));
      assert.ok(screen.getByText('Partenaire OIDC'));
      assert.ok(
        screen.getByText(
          this.intl.t('pages.login-or-register-oidc.register-form.information.given-name', {
            givenName: 'Mélusine',
          }),
        ),
      );
      assert.ok(
        screen.getByText(
          this.intl.t('pages.login-or-register-oidc.register-form.information.family-name', {
            familyName: 'TITEGOUTTE',
          }),
        ),
      );
      assert.ok(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') }));
    });
  });

  module('on login form', function () {
    test('should display elements for OIDC identity provider', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<Authentication::LoginOrRegisterOidc
  @identityProviderSlug={{this.identityProviderSlug}}
  @givenName={{this.givenName}}
  @familyName={{this.familyName}}
/>`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t('pages.login-or-register-oidc.login-form.title'),
          level: 2,
        }),
      );
      assert.ok(screen.getByRole('textbox', { name: this.intl.t('pages.login-or-register-oidc.login-form.email') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('pages.sign-in.forgotten-password') }));
      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.login-or-register-oidc.login-form.button') }));
      assert.ok(
        screen.getByText(
          this.intl.t('pages.login-or-register-oidc.register-form.information.given-name', {
            givenName: 'Mélusine',
          }),
        ),
      );
      assert.ok(
        screen.getByText(
          this.intl.t('pages.login-or-register-oidc.register-form.information.family-name', {
            familyName: 'TITEGOUTTE',
          }),
        ),
      );
    });
  });
});
