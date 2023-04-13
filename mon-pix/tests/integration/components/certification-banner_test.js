import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
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
      const screen = await render(hbs`<CertificationBanner @certification={{this.certification}} />`);

      // then
      assert.dom(screen.getByRole('heading', { name: fullName })).exists();
    });

    test('should render component with certificationNumber', async function (assert) {
      // when
      const screen = await render(hbs`<CertificationBanner @certificationNumber={{this.certificationNumber}} />`);

      // then
      assert.dom(screen.getByText('N° de certification')).exists();
      assert.dom(screen.getByText(certificationNumber)).exists();
    });
  });
});
