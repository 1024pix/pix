import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render as renderScreen } from '@1024pix/ember-testing-library';

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
    this.set('organization', organization);

    // when
    const screen = await renderScreen(hbs`<Organizations::Children::ListItem @organization={{this.organization}} />`);

    // then
    assert.dom(screen.getByRole('row', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('cell', { name: '1' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'UA123456' })).exists();
  });
});
