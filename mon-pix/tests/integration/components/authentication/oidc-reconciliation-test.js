import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

function stubOidcStore(owner, oidcPartners) {
  const oidcIdentityProvidersService = owner.lookup('service:oidcIdentityProviders');
  const storeStub = Service.create({
    findAll: sinon.stub().resolves(oidcPartners),
    peekAll: sinon.stub().returns(oidcPartners),
  });
  oidcIdentityProvidersService.set('store', storeStub);
  return oidcIdentityProvidersService;
}

module('Integration | Component |  authentication | oidc-reconciliation', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display reconciliation page elements', async function (assert) {
    // given
    const oidcPartner1 = Object.create({
      id: 'NOUVEAU_PARTENAIRE',
      code: 'NOUVEAU_PARTENAIRE',
      slug: 'new-oidc-partner',
      organizationName: 'Nouveau partenaire',
    });
    const oidcPartner2 = Object.create({
      id: 'FRANCE_CONNECT',
      code: 'FRANCE_CONNECT',
      slug: 'france-connect',
      organizationName: 'France Connect',
    });
    const oidcPartner3 = Object.create({
      id: 'IMPOTS_GOUV',
      code: 'IMPOTS_GOUV',
      slug: 'impots-gouv',
      organizationName: 'Impots.gouv',
    });
    const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
    const storeStub = Service.create({
      findAll: sinon.stub().resolves([oidcPartner1, oidcPartner2, oidcPartner3]),
      peekAll: sinon.stub().returns([oidcPartner1, oidcPartner2, oidcPartner3]),
    });
    oidcIdentityProvidersService.set('store', storeStub);

    this.set('fullNameFromPix', 'Lloyd Pix');
    this.set('fullNameFromExternalIdentityProvider', 'Lloyd Cé');
    this.set('email', 'lloyidce@example.net');
    this.set('identityProviderSlug', 'new-oidc-partner');
    this.set('authenticationMethods', [{ identityProvider: 'FRANCE_CONNECT' }, { identityProvider: 'IMPOTS_GOUV' }]);

    //  when
    const screen = await render(
      hbs`<Authentication::OidcReconciliation
  @identityProviderSlug={{this.identityProviderSlug}}
  @authenticationMethods={{this.authenticationMethods}}
  @fullNameFromPix={{this.fullNameFromPix}}
  @fullNameFromExternalIdentityProvider={{this.fullNameFromExternalIdentityProvider}}
  @email={{this.email}}
/>`,
    );

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: `${t('pages.oidc-reconciliation.title')} ${t('pages.oidc-reconciliation.sub-title')}`,
      }),
    );
    assert.ok(screen.getByText(t('pages.oidc-reconciliation.information')));
    assert.ok(screen.getByText('Lloyd Cé'));
    assert.ok(screen.getByText('Lloyd Pix'));
    assert.ok(screen.getByText(t('pages.oidc-reconciliation.current-authentication-methods')));
    assert.ok(screen.getByText(t('pages.oidc-reconciliation.email')));
    assert.ok(screen.getByText('lloyidce@example.net'));
    assert.ok(screen.getByText('France Connect'));
    assert.ok(screen.getByText('Impots.gouv'));

    assert.ok(screen.getByText(t('pages.oidc-reconciliation.authentication-method-to-add')));
    assert.ok(screen.getByText(`${t('pages.oidc-reconciliation.external-connection-via')} Nouveau partenaire`));

    assert.ok(screen.getByRole('button', { name: t('pages.oidc-reconciliation.switch-account') }));
    assert.ok(screen.getByRole('button', { name: t('pages.oidc-reconciliation.return') }));
    assert.ok(screen.getByRole('button', { name: t('pages.oidc-reconciliation.confirm') }));
  });

  module('username authentication method', function () {
    test('displays the username when it exists', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      this.set('username', 'lloyd.ce1122');
      this.set('authenticationMethods', []);

      // when
      const screen = await render(
        hbs`<Authentication::OidcReconciliation @authenticationMethods={{this.authenticationMethods}} @username={{this.username}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.oidc-reconciliation.username')));
      assert.ok(screen.getByText('lloyd.ce1122'));
    });

    test('does not display the username when it does not exist', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      this.set('authenticationMethods', []);

      // when
      const screen = await render(
        hbs`<Authentication::OidcReconciliation @authenticationMethods={{this.authenticationMethods}} />`,
      );

      // then
      assert.notOk(screen.queryByText(t('pages.oidc-reconciliation.username')));
    });
  });

  module('email authentication method', function () {
    test('does not display the email when it does not exist', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      this.set('authenticationMethods', []);

      // when
      const screen = await render(
        hbs`<Authentication::OidcReconciliation @authenticationMethods={{this.authenticationMethods}} />`,
      );

      // then
      assert.notOk(screen.queryByText(t('pages.oidc-reconciliation.email')));
    });
  });

  module('GAR authentication method', function () {
    test('displays the GAR authentication method when it exists', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      this.set('authenticationMethods', [{ identityProvider: 'GAR' }]);

      // when
      const screen = await render(
        hbs`<Authentication::OidcReconciliation @authenticationMethods={{this.authenticationMethods}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.user-account.connexion-methods.authentication-methods.gar')));
    });

    test('does not display the GAR authentication method when it does not exist', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      this.set('authenticationMethods', [{ identityProvider: 'OIDC' }]);

      // when
      const screen = await render(
        hbs`<Authentication::OidcReconciliation @authenticationMethods={{this.authenticationMethods}} />`,
      );

      // then
      assert.notOk(screen.queryByText(t('pages.user-account.connexion-methods.authentication-methods.gar')));
    });
  });

  module('when clicking the switch account button', function () {
    test('redirects back to the login or register form', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      const toggleOidcReconciliation = sinon.stub();
      this.set('authenticationMethods', []);
      this.set('toggleOidcReconciliation', toggleOidcReconciliation);

      const screen = await render(
        hbs`<Authentication::OidcReconciliation
  @authenticationMethods={{this.authenticationMethods}}
  @toggleOidcReconciliation={{this.toggleOidcReconciliation}}
/>`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.oidc-reconciliation.switch-account') }));

      // then
      sinon.assert.called(toggleOidcReconciliation);
      assert.ok(true);
    });

    test('redirects back to the login or register form when clicking the return button', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      const toggleOidcReconciliation = sinon.stub();
      this.set('authenticationMethods', []);
      this.set('toggleOidcReconciliation', toggleOidcReconciliation);

      const screen = await render(
        hbs`<Authentication::OidcReconciliation
  @authenticationMethods={{this.authenticationMethods}}
  @toggleOidcReconciliation={{this.toggleOidcReconciliation}}
/>`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.oidc-reconciliation.return') }));

      // then
      sinon.assert.called(toggleOidcReconciliation);
      assert.ok(true);
    });
  });

  module('when clicking the confirm button', function () {
    test('authenticates the user with reconciliation', async function (assert) {
      // given
      stubOidcStore(this.owner, []);
      const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
      this.set('authenticationMethods', []);
      this.set('identityProviderSlug', 'super-idp');
      this.set('authenticationKey', 'super-key');

      const screen = await render(
        hbs`<Authentication::OidcReconciliation
  @authenticationMethods={{this.authenticationMethods}}
  @identityProviderSlug={{this.identityProviderSlug}}
  @authenticationKey={{this.authenticationKey}}
/>`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.oidc-reconciliation.confirm') }));

      // then
      sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oidc', {
        authenticationKey: 'super-key',
        identityProviderSlug: 'super-idp',
        hostSlug: 'user/reconcile',
      });
      assert.ok(true);
    });

    module('when there are errors', function () {
      test('displays an error message when the authentication key has expired', async function (assert) {
        // given
        stubOidcStore(this.owner, []);
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });
        this.set('authenticationMethods', []);
        this.set('identityProviderSlug', 'super-idp');
        this.set('authenticationKey', 'super-key');

        const screen = await render(
          hbs`<Authentication::OidcReconciliation
  @authenticationMethods={{this.authenticationMethods}}
  @identityProviderSlug={{this.identityProviderSlug}}
  @authenticationKey={{this.authenticationKey}}
/>`,
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.oidc-reconciliation.confirm') }));

        // then
        assert.ok(screen.getByText(t('pages.oidc-signup-or-login.error.expired-authentication-key')));
      });

      test('displays a default error message when the error has no specific handling', async function (assert) {
        // given
        stubOidcStore(this.owner, []);
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '500' }] });
        this.set('authenticationMethods', []);
        this.set('identityProviderSlug', 'super-idp');
        this.set('authenticationKey', 'super-key');

        const screen = await render(
          hbs`<Authentication::OidcReconciliation
  @authenticationMethods={{this.authenticationMethods}}
  @identityProviderSlug={{this.identityProviderSlug}}
  @authenticationKey={{this.authenticationKey}}
/>`,
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.oidc-reconciliation.confirm') }));

        // then
        assert.ok(screen.getByText((content) => content.includes('Impossible de se connecter. Veuillez réessayer')));
      });
    });
  });
});
