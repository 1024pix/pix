import { find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Item', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render', async function (assert) {
    // given
    this.set('challenge', {
      type: 'QROC',
      timer: false,
      format: 'phrase',
      proposals: '${myInput}',
    });
    this.set('answer', {});

    // when
    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @answer={{this.answer}} />`);

    // then
    assert.dom(find('.challenge-item')).exists();
  });
});
