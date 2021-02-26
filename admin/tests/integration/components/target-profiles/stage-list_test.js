import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::StageList', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the items', async function(assert) {
    // given
    const stage = EmberObject.create({
      id: 1,
      threshold: '100',
      title: 'My title',
      message: 'My message',
    });
    this.set('stage', {
      list: [stage],
      imageUrl: 'data:,',
    });

    // when
    await render(hbs`<TargetProfiles::StageList @model={{this.stage}} />`);

    // then
    assert.dom('table').exists();
    assert.dom('thead').exists();
    assert.dom('tbody').exists();
    assert.contains('ID');
    assert.contains('Image');
    assert.contains('Threshold');
    assert.contains('Nom');
    assert.contains('Message');
    assert.dom('tbody tr').exists({ count: 1 });
    assert.equal(find('tbody tr td:first-child').textContent, '1');
    assert.dom('tbody tr td:nth-child(2) img').exists();
    assert.equal(find('tbody tr td:nth-child(2) img').getAttribute('src'), 'data:,');
    assert.equal(find('tbody tr td:nth-child(3)').textContent, '100');
    assert.equal(find('tbody tr td:nth-child(4)').textContent, 'My title');
    assert.equal(find('tbody tr td:nth-child(5)').textContent, 'My message');
    assert.notContains('Aucun résultat thématique associé');
  });

  test('it should display a message when empty', async function(assert) {
    // given
    this.set('stage', { list: [] });

    // when
    await render(hbs`<TargetProfiles::StageList @model={{this.stage}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.contains('Aucun palier associé');
  });
});
