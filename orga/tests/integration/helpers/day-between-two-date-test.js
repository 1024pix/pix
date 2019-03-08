import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | day-between-two-date', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it should return the days between two date', async function(assert) {
    this.set('datevalue1', '2019-03-07T10:57:31.567Z');
    this.set('datevalue2', '2019-04-12T10:57:31.567Z');

    await render(hbs`{{day-between-two-date datevalue1 datevalue2}}`);

    assert.equal(this.element.textContent.trim(), '36');
  });

  test('it should always return a positive number of days between two date', async function(assert) {
    this.set('datevalue1', '2019-04-12T10:57:31.567Z');
    this.set('datevalue2', '2019-03-07T10:57:31.567Z');

    await render(hbs`{{day-between-two-date datevalue1 datevalue2}}`);

    assert.equal(this.element.textContent.trim(), '36');
  });
});
