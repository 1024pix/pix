import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | confirm-popup', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('display', true)
    this.set('actionConfirm', () => {
    });
    this.set('actionCancel', () => {
    });

    await render(hbs`{{confirm-popup show=display confirm=actionConfirm cancel=actionCancel }}`);

    assert.dom('.modal-dialog').exists();
  });
});
