import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | action-btn', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the text passed in when not in a loading state by default', async function(assert) {
    await render(hbs`
      <ActionButton>
        Finalize
      </ActionButton>
    `);
    assert.dom(this.element).hasText('Finalize');
  });
  test('it renders a loader when in a loading state', async function(assert) {
    this.set('isLoading', true);
    await render(hbs`
      <ActionButton @isLoading={{true}}>
        Finalize
      </ActionButton>
    `);
    assert.dom(this.element.firstElementChild.firstElementChild).hasClass('button__loader');
  });
});
