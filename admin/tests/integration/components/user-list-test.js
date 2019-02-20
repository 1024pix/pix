import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | user-list', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    const user1 = EmberObject.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'jdoe@example.net',
    });

    this.set('model', [user1]);

    // Template block usage:
    await render(hbs`{{user-list users=model}}`);

    assert.dom('.user-list').exists();
    assert.equal(this.element.querySelectorAll('table tbody tr').length, 1);
  });
});
