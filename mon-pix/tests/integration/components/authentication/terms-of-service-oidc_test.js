import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | authentication::terms-of-service-oidc', function () {
  setupIntlRenderingTest();

  it('should display terms of service for OIDC identity provider', async function () {
    // given & when
    await render(hbs`<Authentication::TermsOfServiceOidc />`);

    // then
    const heading = this.intl.t('pages.terms-of-service-oidc.title');
    const checkboxLabel = this.intl.t('pages.terms-of-service-oidc.cgu');
    const cancelButton = this.intl.t('common.actions.back');
    const submitButton = this.intl.t('pages.terms-of-service-oidc.form.button');
    expect(heading).to.exist;
    expect(checkboxLabel).to.exist;
    expect(cancelButton).to.exist;
    expect(submitButton).to.exist;
  });
});
