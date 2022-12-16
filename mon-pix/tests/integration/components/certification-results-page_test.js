import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | certification results template', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When component is rendered', function (hooks) {
    const certificationNumber = 'certification-number';

    hooks.beforeEach(function () {
      this.set('certificationNumber', certificationNumber);
    });

    test('should not be able to click on validation button when the verification is unchecked ', async function (assert) {
      // when
      await render(hbs`{{certification-results-page certificationNumber=this.certificationNumber}}`);

      // then
      assert.dom('.result-content__validation-button').doesNotExist();
      assert.dom('.result-content__button-blocked').exists();
    });

    test('should be able to click on validation when we check to show the last message', async function (assert) {
      // when
      const screen = await render(hbs`{{certification-results-page certificationNumber=this.certificationNumber}}`);
      await click(
        screen.getByRole('checkbox', { name: this.intl.t('pages.certification-results.not-finished.checkbox-label') })
      );
      await clickByLabel(this.intl.t('pages.certification-results.action.confirm'));

      // then
      assert.ok(
        find('.result-content__panel-description').textContent.includes(
          'Vos résultats seront prochainement disponibles depuis votre compte.'
        )
      );
    });

    test('should have a button to logout at the end of certification', async function (assert) {
      // when
      const screen = await render(hbs`{{certification-results-page certificationNumber=this.certificationNumber}}`);
      await click(
        screen.getByRole('checkbox', { name: this.intl.t('pages.certification-results.not-finished.checkbox-label') })
      );
      await clickByLabel(this.intl.t('pages.certification-results.action.confirm'));

      // then
      assert.dom('.result-content__logout-button').exists();
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(find('.result-content__logout-button').textContent, 'Se déconnecter');
    });
  });
});
