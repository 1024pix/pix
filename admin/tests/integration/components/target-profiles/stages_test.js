import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Stages', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the items', async function(assert) {
    // given
    const stage = EmberObject.create({
      id: 1,
      threshold: '100',
      title: 'My title',
      message: 'My message',
    });
    this.set('stages', [stage]);
    this.set('targetProfile', { imageUrl: 'data:,' });

    // when
    await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}}/>`);

    // then
    assert.dom('table').exists();
    assert.dom('thead').exists();
    assert.dom('tbody').exists();
    assert.contains('ID');
    assert.contains('Image');
    assert.contains('Threshold');
    assert.contains('Titre');
    assert.contains('Message');
    assert.contains('Actions');
    assert.dom('tbody tr').exists({ count: 1 });
    assert.equal(find('tbody tr td:first-child').textContent.trim(), '1');
    assert.dom('tbody tr td:nth-child(2) img').exists();
    assert.equal(find('tbody tr td:nth-child(2) img').getAttribute('src'), 'data:,');
    assert.equal(find('tbody tr td:nth-child(3)').textContent.trim(), '100');
    assert.equal(find('tbody tr td:nth-child(4)').textContent.trim(), 'My title');
    assert.equal(find('tbody tr td:nth-child(5)').textContent.trim(), 'My message');
    assert.equal(find('tbody tr td:nth-child(6)').textContent.trim(), 'Voir détail');
    assert.notContains('Aucun résultat thématique associé');
  });

  test('it should display a message when empty', async function(assert) {
    // given
    this.set('stages', []);

    // when
    await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.contains('Aucun palier associé');
  });

  test('it should display a message when there is no stages with threshold 0', async function(assert) {
    // given
    this.set('stages', []);

    // when
    await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.contains('Aucun palier associé');
  });

  test('it should display a warning when there is no threshold at 0', async function(assert) {
    // given
    const stage = EmberObject.create({
      id: 1,
      threshold: '100',
      title: 'My title',
      message: 'My message',
    });
    this.set('stages', [stage]);

    // when
    await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.contains('Attention ! Il n\'y a pas de palier à 0');
  });
});
