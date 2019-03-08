import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | format-date', function(hooks) {
  setupRenderingTest(hooks);

  test('it should replace date with a correct format', async function(assert) {
    this.set('datevalue', '2019-03-07T10:57:31.567Z');

    await render(hbs`{{format-date datevalue}}`);

    assert.equal(this.element.textContent.trim(), '7 mars 2019');
  });
});
