import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Item', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set(
      'challenge',
      store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      }),
    );
    this.set('answer', {});

    // when
    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @answer={{this.answer}} />`);

    // then
    assert.dom('.challenge-item').exists();
  });
});
