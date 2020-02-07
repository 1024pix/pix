import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-formbuilder-link-step', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<SessionFinalizationFormbuilderLinkStep />`);

    assert.equal(this.element.textContent.trim().replace(/\s+/g, ' '), 'Pour transmettre le PV de session scanné, suivez ce lien Formulaire 123formbuilder');
  });
});
