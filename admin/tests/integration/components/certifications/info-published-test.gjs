import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import InfoPublished from 'pix-admin/components/certifications/info-published';
import { module, test } from 'qunit';

module('Integration | Component | certifications/info-published', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    const certification = { isPublished: true };

    // when
    await render(<template><InfoPublished @record={{certification}} /></template>);

    // then
    assert.dom('svg').exists();
  });
});
