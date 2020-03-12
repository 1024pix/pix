import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-target-profiles-section', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the target profile', async function(assert) {
    // given
    const targetProfile1 = EmberObject.create({ id: 123, name: 'target Profile of the Night' });
    const targetProfile2 = EmberObject.create({ id: 456, name: 'target Profile of the Death' });
    this.set('targetProfiles', [ targetProfile1, targetProfile2 ]);

    // when
    await render(hbs`{{organization-target-profiles-section targetProfiles=targetProfiles }}`);

    // then
    assert.dom('table tbody tr').exists({ count: 2 });
    assert.dom('table tbody tr:first-child td:first-child').hasText('123');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('target Profile of the Night');
  });
});
