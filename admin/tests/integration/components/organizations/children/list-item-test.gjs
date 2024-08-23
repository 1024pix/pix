import { render as renderScreen } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import ListItem from 'pix-admin/components/organizations/children/list-item';
import { module, test } from 'qunit';

module('Integration | Component | organizations/children/list-item', function (hooks) {
  setupRenderingTest(hooks);

  test('displays child organization items', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization', {
      id: 1,
      name: 'Collège The Night Watch',
      externalId: 'UA123456',
    });

    // when
    const screen = await renderScreen(<template><ListItem @organization={{organization}} /></template>);

    // then
    assert.dom(screen.getByRole('row', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('cell', { name: '1' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'UA123456' })).exists();
  });
});
