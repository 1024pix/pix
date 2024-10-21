import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Ui::Chevron', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const onClick = sinon.stub();
    this.set('isOpen', false);
    this.set('click', onClick);
    this.set('label', 'mon-label');
  });

  test('it renders', async function (assert) {
    // when
    const screen = await render(
      hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} @ariaLabel={{this.label}} />`,
    );

    // then
    assert.dom('button[type=button]').exists();
    assert.dom('[aria-expanded="false"]').exists();
    assert.ok(screen.getByLabelText('mon-label'));
  });

  test('it should open the accordion when it is closed', async function (assert) {
    // given
    await render(hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} />`);

    // when
    this.set('isOpen', true);

    // then
    assert.dom('[aria-expanded="true"]').exists();
  });

  test('it should close the accordion when it already open', async function (assert) {
    // given
    await render(hbs`<Ui::Chevron @isOpen={{this.isOpen}} @onClick={{this.click}} />`);
    this.set('isOpen', true);

    // when
    this.set('isOpen', false);

    // then
    assert.dom('[aria-expanded="false"]').exists();
  });
});
