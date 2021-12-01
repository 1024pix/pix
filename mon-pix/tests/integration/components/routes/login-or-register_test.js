import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../../helpers/click-by-label';

describe('Integration | Routes | routes/login-or-register', function () {
  setupIntlRenderingTest();
  beforeEach(function () {
    this.set('toggleFormsVisibility', '');
  });

  it('should display the organization name the user is invited to', async () => {
    // when
    await render(
      hbs`<Routes::LoginOrRegister @organizationName="Organization Aztec" @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // then
    expect('Organization Aztec vous invite à rejoindre Pix').to.exist;
  });

  it('should contain an open register form and closed login form', async function () {
    // when
    await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{true}} @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // then
    expect(find('.register-form')).to.exist;
    expect(find('.login-form')).to.not.exist;
  });

  it('should open the login panel and close the register panel when clicking on login button', async function () {
    // given
    await render(
      hbs`<Routes::LoginOrRegister @displayRegisterForm={{false}} @toggleFormsVisibility=toggleFormsVisibility/>`
    );

    // when
    await clickByLabel(this.intl.t('pages.login-or-register.login-form.button'));

    // then
    expect(find('.register-form')).to.not.exist;
    expect(find('.login-form')).to.exist;
  });
});
