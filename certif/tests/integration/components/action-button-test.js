import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | action-btn', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the text passed in when not in a loading state by default', async function(assert) {
    const fakeFunc = () => {};
    this.set('fakeFunc', fakeFunc);
    await render(hbs`
      <ActionButton @handleClick={{this.fakeFunc}}>
        Finalize
      </ActionButton>
    `);

    assert.dom('[data-test-id="action-button"]').hasText('Finalize');
  });

  test('it renders a loader when in a loading state', async function(assert) {
    const fakeFunc = () => {};
    this.set('isLoading', true);
    this.set('fakeFunc', fakeFunc);
    await render(hbs`
      <ActionButton @isLoading={{this.isLoading}} @handleClick={{this.fakeFunc}}>
        Finalize
      </ActionButton>
    `);

    assert.dom('[data-test-id="action-button"] > span').hasClass('button__loader');
  });
});
