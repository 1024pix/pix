import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-step-container', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`
      <SessionFinalizationStepContainer @number="1" @title="title">
        template block text
      </SessionFinalizationStepContainer>
    `);

    assert.equal(this.element.textContent.trim().replace(/\s+/g, ' '), 'Étape 1 : title template block text');
  });
});
