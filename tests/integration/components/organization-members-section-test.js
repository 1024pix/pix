import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organization-members-section', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    this.set('addMembership', () => true);

    await render(hbs`{{organization-members-section addMembership=(action addMembership)}}`);

    assert.dom('.member-list').exists();
  });
});
