import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Badges', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the items', async function(assert) {
    // given
    const badge = EmberObject.create({
      id: 1,
      key: 'My key',
      title: 'My title',
      message: 'My message',
      imageUrl: 'data:,',
      altMessage: 'My alt message',
    });
    this.set('badges', [badge]);

    // when
    await render(hbs`<TargetProfiles::Badges @badges={{this.badges}} />`);

    // then
    assert.dom('table').exists();
    assert.dom('thead').exists();
    assert.dom('tbody').exists();
    assert.contains('ID');
    assert.contains('Image');
    assert.contains('Key');
    assert.contains('Nom');
    assert.contains('Message');
    assert.dom('tbody tr').exists({ count: 1 });
    assert.equal(find('tbody tr td:first-child').textContent, '1');
    assert.dom('tbody tr td:nth-child(2) img').exists();
    assert.equal(find('tbody tr td:nth-child(2) img').getAttribute('src'), 'data:,');
    assert.equal(find('tbody tr td:nth-child(2) img').getAttribute('alt'), 'My alt message');
    assert.equal(find('tbody tr td:nth-child(3)').textContent, 'My key');
    assert.equal(find('tbody tr td:nth-child(4)').textContent, 'My title');
    assert.equal(find('tbody tr td:nth-child(5)').textContent, 'My message');
    assert.notContains('Aucun résultat thématique associé');
  });

  test('it should display a message when empty', async function(assert) {
    // given
    this.set('badges', []);

    // when
    await render(hbs`<TargetProfiles::Badges @badges={{this.badges}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.contains('Aucun résultat thématique associé');
  });
});
