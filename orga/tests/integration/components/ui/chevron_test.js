import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui::Chevron', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const onClick = sinon.stub();
    this.set('isOpen', false);
    this.set('click', onClick);
  });

  test('it renders', async function (assert) {
    // when
    await render(hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} />`);

    // then
    assert.dom('button[type=button]').exists();
    assert.dom('[aria-expanded="false"]').exists();
  });

  test('it should open the accordion when it is closed', async function (assert) {
    // given
    await render(hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} />`);

    // when
    await click('[data-icon="chevron-down"]');
    this.set('isOpen', true);

    // then
    assert.dom('[aria-expanded="true"]').exists();
  });

  test('it should close the accordion when it already open', async function (assert) {
    // given
    await render(hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} />`);
    this.set('isOpen', true);

    // when
    await click('[data-icon="chevron-up"]');
    this.set('isOpen', false);

    // then
    assert.dom('[aria-expanded="false"]').exists();
  });
});
