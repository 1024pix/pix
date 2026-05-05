import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

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
});
