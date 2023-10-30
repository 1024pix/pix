import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { findAll } from '@ember/test-helpers';

module('Integration | Component | Module | Text', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Text', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const textElement = store.createRecord('text', { content: 'toto', type: 'texts' });

    this.set('text', textElement);

    //  when
    const screen = await render(hbs`<Module::Text @text={{this.text}}/>`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-text').length, 1);
    assert.ok(screen.getByText('toto'));
  });
});
