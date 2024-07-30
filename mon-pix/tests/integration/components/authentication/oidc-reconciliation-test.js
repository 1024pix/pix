import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import Sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  authentication | oidc-reconciliation', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display reconciliation page elements', async function (assert) {
    // given
    class OidcIdentityProvidersStub extends Service {
      'new-oidc-partner' = { organizationName: 'Nouveau partenaire' };
      list = [
        { organizationName: 'France Connect' },
        { organizationName: 'Impots.gouv' },
        { organizationName: 'Nouveau partenaire' },
      ];
      getIdentityProviderNamesByAuthenticationMethods = Sinon.stub().returns(['France Connect', 'Impots.gouv']);
    }
    this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    this.set('fullNameFromPix', 'Lloyd Pix');
    this.set('fullNameFromExternalIdentityProvider', 'Lloyd Cé');
    this.set('email', 'lloyidce@example.net');
    this.set('identityProviderSlug', 'new-oidc-partner');
    this.set('authenticationMethods', [{ identityProvider: 'France Connect' }, { identityProvider: 'Impots.gouv' }]);

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
        name: `${this.intl.t('pages.oidc-reconciliation.title')} ${this.intl.t('pages.oidc-reconciliation.sub-title')}`,
      }),
    );
    assert.ok(screen.getByText(this.intl.t('pages.oidc-reconciliation.information')));
    assert.ok(screen.getByText('Lloyd Cé'));
    assert.ok(screen.getByText('Lloyd Pix'));
    assert.ok(screen.getByText(this.intl.t('pages.oidc-reconciliation.current-authentication-methods')));
    assert.ok(screen.getByText(this.intl.t('pages.oidc-reconciliation.email')));
    assert.ok(screen.getByText('lloyidce@example.net'));
    assert.ok(screen.getByText('France Connect'));
    assert.ok(screen.getByText('Impots.gouv'));

    assert.ok(screen.getByText(this.intl.t('pages.oidc-reconciliation.authentication-method-to-add')));
    assert.ok(
      screen.getByText(`${this.intl.t('pages.oidc-reconciliation.external-connection-via')} Nouveau partenaire`),
    );

    assert.ok(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.switch-account') }));
    assert.ok(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.return') }));
    assert.ok(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.confirm') }));
  });
});
