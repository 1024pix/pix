import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | <Certification::CertificationInfoPublished/>', (hooks) => {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.set('certification', { isPublished: true });

    // when
    await render(hbs`<Certification::CertificationInfoPublished @record={{this.certification}} />`);

    // then
    assert.dom('svg').exists();
  });
});
