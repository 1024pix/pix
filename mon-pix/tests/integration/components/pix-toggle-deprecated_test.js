import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pix-toggle-deprecated', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.set('valueFirstLabel', 'valueFirstLabel');
    this.set('valueSecondLabel', 'valueSecondLabel');
    this.set('onToggle', function () {
      this.set('loginWithEmail', false);
    });
    this.set('isFirstOn', 'true');

    await render(
      hbs`{{pix-toggle-deprecated onToggle=this.onToggle valueFirstLabel=this.valueFirstLabel valueSecondLabel=this.valueSecondLabel}}`
    );
  });

  test('Default Render', function (assert) {
    assert.dom('.pix-toggle-deprecated').exists();
  });

  test('should display the toggle with on/off span', function (assert) {
    assert.dom('.pix-toggle-deprecated__on').exists();
    assert.dom('.pix-toggle-deprecated__off').exists();
  });

  test('should display the toggle with on/off span with the correct values', function (assert) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__on').nodeName, 'SPAN');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__off').nodeName, 'SPAN');

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__on').textContent, 'valueFirstLabel');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__off').textContent, 'valueSecondLabel');
  });

  test('should change the value of toggleOn when toggle off', async function (assert) {
    await click('.pix-toggle-deprecated__off');

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__on').textContent, 'valueSecondLabel');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__off').textContent, 'valueFirstLabel');

    await click('.pix-toggle-deprecated__off');

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__on').textContent, 'valueFirstLabel');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.pix-toggle-deprecated__off').textContent, 'valueSecondLabel');
  });
});
