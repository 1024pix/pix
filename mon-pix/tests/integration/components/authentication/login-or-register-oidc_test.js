import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | authentication::login-or-register-oidc', function () {
  setupIntlRenderingTest();

  it('should display elements for OIDC identity provider', async function () {
    // given & when
    const screen = await render(hbs`<Authentication::LoginOrRegisterOidc />`);

    // then
    expect(
      screen.getByRole('heading', {
        name: this.intl.t('pages.login-or-register-oidc.title'),
        level: 1,
      })
    ).to.exist;
    expect(screen.getByRole('img', { name: this.intl.t('common.pix') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('common.pix') })).to.exist;
  });

  context('on login form', function () {
    it('should display elements for OIDC identity provider', async function () {
      // given
      this.set('identityProviderSlug', 'pole-emploi');

      // when
      const screen = await render(
        hbs`<Authentication::LoginOrRegisterOidc @identityProviderSlug={{this.identityProviderSlug}} />`
      );

      // then
      expect(
        screen.getByRole('heading', {
          name: this.intl.t('pages.login-or-register-oidc.register-form.title'),
          level: 2,
        })
      ).to.exist;
      expect(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') })).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') })).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') })).to.exist;
      expect(
        screen.getByRole('button', { name: this.intl.t('pages.login-or-register-oidc.register-form.button') })
      ).to.exist;
      expect(
        screen.getByText(
          this.intl.t('pages.login-or-register-oidc.register-form.description', {
            identityProviderOrganizationName: 'Pôle Emploi',
          })
        )
      ).to.exist;
    });
  });

  context('on register form', function () {
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
          name: this.intl.t('pages.login-or-register-oidc.register-form.title'),
          level: 2,
        })
      ).to.exist;
      expect(
        screen.getByRole('textbox', { name: this.intl.t('pages.login-or-register-oidc.login-form.email') })
      ).to.exist;
      expect(screen.getByRole('link', { name: this.intl.t('pages.sign-in.forgotten-password') })).to.exist;
      expect(
        screen.getByRole('button', { name: this.intl.t('pages.login-or-register-oidc.login-form.button') })
      ).to.exist;
    });
  });
});
