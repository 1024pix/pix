import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Stages', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the items', async function (assert) {
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
    const screen = await render(
      hbs`<TargetProfiles::Stages @stages={{this.stages}} @targetProfile={{this.targetProfile}}/>`
    );

    // then
    assert.dom('table').exists();
    assert.dom('thead').exists();
    assert.dom('tbody').exists();
    assert.dom(screen.getByText('ID')).exists();
    assert.dom(screen.getByText('Image')).exists();
    assert.dom(screen.getByText('Seuil')).exists();
    assert.dom(screen.getByText('Titre')).exists();
    assert.dom(screen.getByText('Message')).exists();
    assert.dom(screen.getByText('Titre prescripteur')).exists();
    assert.dom(screen.getByText('Description prescripteur')).exists();
    assert.dom(screen.getByText('Actions')).exists();
    assert.dom('tbody tr').exists({ count: 1 });
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:first-child').textContent.trim(), '1');
    assert.dom('tbody tr td:nth-child(2) img').exists();
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:nth-child(2) img').getAttribute('src'), 'data:,');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:nth-child(3)').textContent.trim(), '100');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:nth-child(4)').textContent.trim(), 'My title');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:nth-child(5)').textContent.trim(), 'My message');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('tbody tr td:nth-child(8)').textContent.trim(), 'Voir détail');
    assert.dom(screen.queryByText('Aucun résultat thématique associé')).doesNotExist();
  });

  test('it should display a message when empty', async function (assert) {
    // given
    this.set('stages', []);

    // when
    const screen = await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.dom(screen.getByText('Aucun palier associé')).exists();
  });

  test('it should display a message when there is no stages with threshold 0', async function (assert) {
    // given
    this.set('stages', []);

    // when
    const screen = await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.dom(screen.getByText('Aucun palier associé')).exists();
  });

  test('it should display a warning when there is no threshold at 0', async function (assert) {
    // given
    const stage = EmberObject.create({
      id: 1,
      threshold: '100',
      title: 'My title',
      message: 'My message',
    });
    this.set('stages', [stage]);

    // when
    const screen = await render(hbs`<TargetProfiles::Stages @stages={{this.stages}} />`);

    // then
    assert.dom(screen.getByText("Attention ! Il n'y a pas de palier à 0")).exists();
  });
});
