import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';

module('Integration | Component | certification results template', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When component is rendered', function () {
    const certificationNumber = 'certification-number';

    hooks.beforeEach(function () {
      this.set('certificationNumber', certificationNumber);
    });

    test('should not be able to click on validation button when the verification is unchecked ', async function (assert) {
      // when
      await render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);

      // then
      assert.dom(find('.result-content__validation-button')).doesNotExist();
      assert.dom(find('.result-content__button-blocked')).exists();
    });

    test('should be able to click on validation when we check to show the last message', async function (assert) {
      // when
      await render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);
      await click('#validSupervisor');
      await clickByLabel(this.intl.t('pages.certification-results.action.confirm'));

      // then
      assert
        .dom(find('.result-content__panel-description').textContent)
        .hasText('Vos résultats seront prochainement disponibles depuis votre compte.');
    });

    test('should have a button to logout at the end of certification', async function (assert) {
      // when
      await render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);
      await click('#validSupervisor');
      await clickByLabel(this.intl.t('pages.certification-results.action.confirm'));

      // then
      assert.dom(find('.result-content__logout-button')).exists();
      assert.equal(find('.result-content__logout-button').textContent, 'Se déconnecter');
    });
  });
});
