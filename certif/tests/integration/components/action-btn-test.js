import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | action-btn', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the text passed in when not in a loading state by default', async function(assert) {
    await render(hbs`
      <ActionBtn>
        Finalize
      </ActionBtn>
    `);
    assert.equal(this.element.textContent.trim(), 'Finalize');
  });
  test('it renders a loader when in a loading state', async function(assert) {
    this.set('isLoading', true);
    await render(hbs`
      <ActionBtn @isLoading={{true}}>
        Finalize
      </ActionBtn>
    `);
    assert.ok(this.element.firstElementChild.firstElementChild.classList.contains('button__loader'));
  });
});
