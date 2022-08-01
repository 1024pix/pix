import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | authentication::login-or-register-oidc', function () {
  setupIntlRenderingTest();

  it('should display elements for OIDC identity provider', async function () {
    // given
    this.set('identityProviderSlug', 'cnav');

    // when
    const screen = await render(
      hbs`<Authentication::LoginOrRegisterOidc @identityProviderSlug={{this.identityProviderSlug}} />`
    );

    // then
    expect(
      screen.getByRole('heading', {
        name: this.intl.t('pages.login-or-register-oidc.title'),
        level: 1,
      })
    ).to.exist;
    expect(
      screen.getByRole('heading', {
        name: this.intl.t('pages.login-or-register-oidc.register-form.title'),
        level: 2,
      })
    ).to.exist;
    expect(
      screen.getByRole('heading', {
        name: this.intl.t('pages.login-or-register-oidc.login-form.title'),
        level: 2,
      })
    ).to.exist;
    expect(screen.getByRole('img', { name: this.intl.t('common.pix') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('common.pix') })).to.exist;
  });
});
