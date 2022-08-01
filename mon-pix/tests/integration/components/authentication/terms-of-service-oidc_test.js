import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | authentication::terms-of-service-oidc', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display terms of service for OIDC identity provider', async function (assert) {
    // given & when
    await render(hbs`<Authentication::TermsOfServiceOidc />`);

    // then
    const heading = this.intl.t('pages.terms-of-service-oidc.title');
    const checkboxLabel = this.intl.t('pages.terms-of-service-oidc.cgu');
    const cancelButton = this.intl.t('common.actions.back');
    const submitButton = this.intl.t('pages.terms-of-service-oidc.form.button');
    assert.dom(heading).exists();
    assert.dom(checkboxLabel).exists();
    assert.dom(cancelButton).exists();
    assert.dom(submitButton).exists();
  });
});
