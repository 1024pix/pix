import { expect } from 'chai';
import { describe, it } from 'mocha';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component |  authentication | oidc-reconciliation', function () {
  setupIntlRenderingTest();

  it('should display reconciliation page elements', async function () {
    // given
    const oidcPartner = {
      organizationName: 'Partenaire OIDC',
    };
    class OidcIdentityProvidersStub extends Service {
      'oidc-partner' = oidcPartner;
      list = [oidcPartner];
    }
    this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    this.set('fullNameFromPix', 'Lloyd Pix');
    this.set('fullNameFromExternalIdentityProvider', 'Lloyd Cé');
    this.set('email', 'lloyidce@example.net');
    this.set('identityProviderSlug', 'oidc-partner');
    this.set('authenticationMethods', [{ identityProvider: 'CNAV' }]);

    //  when
    const screen = await render(
      hbs`<Authentication::OidcReconciliation @identityProviderSlug={{this.identityProviderSlug}} @authenticationMethods={{this.authenticationMethods}} @fullNameFromPix={{this.fullNameFromPix}} @fullNameFromExternalIdentityProvider={{this.fullNameFromExternalIdentityProvider}} @email={{this.email}}/>`
    );

    // then
    expect(
      screen.getByRole('heading', {
        name: `${this.intl.t('pages.oidc-reconciliation.title')} ${this.intl.t('pages.oidc-reconciliation.sub-title')}`,
      })
    ).to.exist;
    expect(screen.getByText(this.intl.t('pages.oidc-reconciliation.information'))).to.exist;
    expect(screen.getByText('Lloyd Cé')).to.exist;
    expect(screen.getByText('Lloyd Pix')).to.exist;
    expect(screen.getByText(this.intl.t('pages.oidc-reconciliation.current-authentication-methods'))).to.exist;
    expect(screen.getByText(this.intl.t('pages.oidc-reconciliation.email'))).to.exist;
    expect(screen.getByText('lloyidce@example.net')).to.exist;

    expect(screen.getByText(this.intl.t('pages.oidc-reconciliation.authentication-method-to-add'))).to.exist;
    expect(screen.getByText(this.intl.t('pages.oidc-reconciliation.external-connection'))).to.exist;
    expect(screen.getByText(`${this.intl.t('pages.oidc-reconciliation.external-connection-via')} Partenaire OIDC`)).to
      .exist;

    expect(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.switch-account') })).to.exist;
    expect(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.return') })).to.exist;
    expect(screen.getByRole('button', { name: this.intl.t('pages.oidc-reconciliation.confirm') })).to.exist;
  });
});
