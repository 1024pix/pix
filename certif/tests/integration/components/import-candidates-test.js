import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | import-candidates', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('session', {
      certificationCandidates: [],
    });
    await render(hbs`<ImportCandidates @session={{session}}/>`);

    assert.ok(true);
  });
});
