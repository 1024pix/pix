import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { getRootElement, click, triggerKeyEvent } from '@ember/test-helpers';
import { clickByName, render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | modal', function (hooks) {
  setupRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render title and content', async function (assert) {
      // given
      this.set('title', 'Mon titre');

      const screen = await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      this.set('display', true);

      // then
      assert.dom(screen.getByText('Mon titre')).exists();
      assert.dom(screen.getByText('Mon contenu')).exists();
    });

    test('should not display the modal', async function (assert) {
      // given
      this.set('title', 'Mon titre');

      const screen = await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      this.set('display', false);

      // then
      assert.dom(screen.queryByText('Mon titre')).doesNotExist();
    });

    test('should call close method when user clicks on close button', async function (assert) {
      // given
      const close = sinon.stub();
      this.set('close', close);
      this.set('title', 'Mon titre');
      this.set('display', true);

      await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @close={{close}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      await clickByName('Fermer');

      // then
      assert.ok(close.called);
    });

    test('should call close method when user clicks on overlay', async function (assert) {
      // given
      const close = sinon.stub();
      this.set('close', close);
      this.set('title', 'Mon titre');
      this.set('display', true);

      await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @close={{close}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      await click('[data-emd-overlay]');

      // then
      assert.ok(close.called);
    });

    test('should call close method when user press Escape', async function (assert) {
      // given
      const close = sinon.stub();
      this.set('close', close);
      this.set('title', 'Mon titre');
      this.set('display', true);

      await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @close={{close}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      await triggerKeyEvent(getRootElement(), 'keyup', 'Escape');

      // then
      assert.ok(close.called);
    });

    test('should be accessible', async function (assert) {
      // given
      this.set('title', 'Mon titre');

      await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      this.set('display', true);

      // then
      assert.dom('[aria-modal="true"]').exists();
      assert.dom('[role="dialog"]').exists();
      assert.dom('[aria-labelledby="modal_mon_titre_label"]').exists();
      assert.dom('#modal_mon_titre_label').exists();
    });

    test('should add additional container class', async function (assert) {
      // given
      this.set('title', 'Mon titre');

      await render(
        hbs`<Modal::Dialog @display={{display}} @title={{title}} @additionalContainerClass={{additionalContainerClass}}>Mon contenu</Modal::Dialog>`
      );

      // when
      const additionalContainerClass = 'a_class';
      this.set('display', true);
      this.set('additionalContainerClass', additionalContainerClass);

      // then
      assert.dom('.modal-dialog').hasClass(additionalContainerClass);
    });
  });
});
