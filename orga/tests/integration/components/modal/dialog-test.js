import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { getRootElement, render, click, triggerKeyEvent } from '@ember/test-helpers';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | modal', function(hooks) {
  setupRenderingTest(hooks);

  module('Component rendering', function() {
    let close;

    hooks.beforeEach(function() {
      close = sinon.stub();
      this.set('close', close);
      this.set('title', 'Mon titre');

      return render(hbs`<Modal::Dialog @display={{display}} @title={{title}} @close={{close}}>Mon contenu</Modal::Dialog>`);
    });

    test('should render title and content', async function(assert) {
      this.set('display', true);

      assert.contains('Mon titre');
      assert.contains('Mon contenu');
    });

    test('should not display the modal', async function(assert) {
      this.set('display', false);

      assert.notContains('Mon titre');
    });

    test('should call close method when user clicks on close button', async function(assert) {
      this.set('display', true);

      await click('[aria-label="Fermer la fenêtre"]');

      assert.ok(close.called);
    });

    test('should call close method when user clicks on overlay', async function(assert) {
      this.set('display', true);

      await click('[data-emd-overlay]');

      assert.ok(close.called);
    });

    test('should call close method when user press Escape', async function(assert) {
      this.set('display', true);

      await triggerKeyEvent(getRootElement(), 'keyup', 'Escape');

      assert.ok(close.called);
    });

    test('should be accessible', async function(assert) {
      this.set('display', true);

      assert.dom('[aria-modal="true"]').exists();
      assert.dom('[role="dialog"]').exists();
      assert.dom('[aria-labelledby="modal_mon_titre_label"]').exists();
      assert.dom('#modal_mon_titre_label').exists();
    });
  });
});
