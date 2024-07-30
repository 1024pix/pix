import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | certifications/info-published', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.set('certification', { isPublished: true });

    // when
    await render(hbs`<Certifications::InfoPublished @record={{this.certification}} />`);

    // then
    assert.dom('svg').exists();
  });
});
