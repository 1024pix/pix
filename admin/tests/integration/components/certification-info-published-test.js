import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | <CertificationInfoPublished/>', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.set('certification', { isPublished: true });

    // when
    await render(hbs`<CertificationInfoPublished @certification={{this.certification}} />`);

    // then
    assert.dom('svg').exists();
  });
});
