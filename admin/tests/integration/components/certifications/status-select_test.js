import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';

module('Integration | Component | certifications/status-select', function (hooks) {
  setupRenderingTest(hooks);

  module('when in edition mode', function () {
    test('it updates the certification status when the selected value changes', async function (assert) {
      // given
      const certification = EmberObject.create({ status: 'started' });
      this.set('certification', certification);
      const screen = await render(
        hbs`<Certifications::StatusSelect @edition={{true}} @certification={{this.certification}} />`
      );

      // when
      await click(screen.getByText('Statut :'));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Validée' }));

      // then
      assert.strictEqual(certification.status, 'validated');
    });
  });

  module('when not in edition mode', function () {
    test('it does not render the select', async function (assert) {
      // given
      const certification = EmberObject.create({ status: 'started' });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`<Certifications::StatusSelect @certification={{this.certification}} />`);

      // then
      assert.dom(screen.queryByRole('combobox', { name: 'Statut :' })).doesNotExist();
    });
  });
});
