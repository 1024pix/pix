import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | TargetProfiles::Badges', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the items', async function (assert) {
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
    assert.contains('Clé');
    assert.contains('Nom');
    assert.contains('Message');
    assert.contains('Actions');
    assert.dom('tbody tr').exists({ count: 1 });
    assert.strictEqual(find('tbody tr td:first-child').textContent, '1');
    assert.dom('tbody tr td:nth-child(2) img').exists();
    assert.strictEqual(find('tbody tr td:nth-child(2) img').getAttribute('src'), 'data:,');
    assert.strictEqual(find('tbody tr td:nth-child(2) img').getAttribute('alt'), 'My alt message');
    assert.contains('My key');
    assert.contains('My title');
    assert.contains('My message');
    assert.contains('Voir détail');
    assert.notContains('Aucun résultat thématique associé');
  });

  test('it should display a message when empty', async function (assert) {
    // given
    this.set('badges', []);

    // when
    await render(hbs`<TargetProfiles::Badges @badges={{this.badges}} />`);

    // then
    assert.dom('table').doesNotExist();
    assert.contains('Aucun résultat thématique associé');
  });

  module('when deleting a badge', function (hooks) {
    let badge;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');
      badge = store.push({
        data: {
          id: 'badgeId',
          type: 'badge',
          attributes: {
            key: 'My key',
            title: 'My title',
            message: 'My message',
            imageUrl: 'data:,',
            altMessage: 'My alt message',
          },
        },
      });
      badge.destroyRecord = sinon.stub();
      this.set('badges', [badge]);

      // when
      await render(hbs`<TargetProfiles::Badges @badges={{this.badges}} />`);
      await clickByName('Supprimer');
    });

    test('should open confirm modal', function (assert) {
      // then
      assert.dom('.modal-dialog').exists();
      assert.contains("Suppression d'un résultat thématique");
      assert.contains('Êtes-vous sûr de vouloir supprimer ce résultat thématique ?');
    });

    test('should close confirm modal on click on cancel', async function (assert) {
      // when
      await click('.modal-footer > button.btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });

    test('should delete the badge on confirmation click', async function (assert) {
      // when
      await click('.modal-footer > button.btn-primary');

      // then
      assert.ok(badge.destroyRecord.called);
    });
  });
});
