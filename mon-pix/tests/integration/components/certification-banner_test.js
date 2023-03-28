import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('On component rendering', function (hooks) {
    const firstName = 'tom';
    const lastName = 'jedusor';
    const fullName = 'Tom JEDUSOR';
    const certificationNumber = 100;

    hooks.beforeEach(function () {
      // given
      const certification = EmberObject.create({
        id: certificationNumber,
        firstName,
        lastName,
      });
      this.set('certificationNumber', certificationNumber);
      this.set('certification', certification);
    });

    test('should render component with user fullName', async function (assert) {
      // when
      await render(hbs`<CertificationBanner @certification={{this.certification}} />`);

      // then
      assert.strictEqual(find('.assessment-banner__title').textContent.trim(), fullName);
    });

    test('should render component with certificationNumber', async function (assert) {
      // when
      await render(hbs`<CertificationBanner @certificationNumber={{this.certificationNumber}} />`);

      // then
      assert.strictEqual(find('.certification-number__value').textContent.trim(), `${certificationNumber}`);
    });
  });
});
