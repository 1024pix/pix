import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CertificationVerificationCodeForm from 'mon-pix/components/certification-verification-code-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification verification code form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display component', async function (assert) {
    // given
    // when
    const screen = await render(<template><CertificationVerificationCodeForm /></template>);

    // then
    assert
      .dom(screen.getByRole('heading', { name: t('pages.fill-in-certificate-verification-code.first-title') }))
      .exists();
    assert
      .dom(
        screen.getByText(t('pages.fill-in-certificate-verification-code.description'), { collapseWhitespace: false }),
      )
      .exists();
    assert.dom(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' })).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.fill-in-certificate-verification-code.verify') })).exists();
  });

  module('error cases', function () {
    module('when certificate verification code is empty', function () {
      test('displays error message', async function (assert) {
        // given
        const clearErrors = () => {};
        const screen = await render(
          <template><CertificationVerificationCodeForm @clearErrors={{clearErrors}} /></template>,
        );
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), '');

        // when
        await click(screen.getByRole('button', { name: t('pages.fill-in-certificate-verification-code.verify') }));

        // then
        assert.dom(screen.getByText(t('pages.fill-in-certificate-verification-code.errors.missing-code'))).exists();
      });
    });

    module('when certificate verification code is wrong', function () {
      test('displays error message', async function (assert) {
        // given
        const clearErrors = () => {};
        const screen = await render(
          <template><CertificationVerificationCodeForm @clearErrors={{clearErrors}} /></template>,
        );
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), '12345678');

        // when
        await click(screen.getByRole('button', { name: t('pages.fill-in-certificate-verification-code.verify') }));

        // then
        assert.dom(screen.getByText(t('pages.fill-in-certificate-verification-code.errors.wrong-format'))).exists();
      });
    });
  });
});
