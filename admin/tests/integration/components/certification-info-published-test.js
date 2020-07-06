import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-info-published', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.set('certification', { isPublished: true });

    // when
    await render(hbs`<CertificationInfoPublished @record={{this.certification}} />`);

    // then
    assert.dom('svg').exists();
  });
});
