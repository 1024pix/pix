import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import InfoPublished from 'pix-admin/components/certifications/info-published';

module('Integration | Component | certifications/info-published', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    this.set('certification', { isPublished: true });

    // when
    await render(<template><InfoPublished @record={{this.certification}} /></template>);

    // then
    assert.dom('svg').exists();
  });
});
