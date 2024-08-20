import { render as renderScreen } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import LoaderGrey from 'pix-admin/components/common/loader-grey';
import { module, test } from 'qunit';

module('Integration | Component |  common/loader-grey', function (hooks) {
  setupRenderingTest(hooks);

  test('should display a loader', async function (assert) {
    // given

    //  when
    const screen = await renderScreen(<template><LoaderGrey /></template>);

    // then
    assert.dom(screen.getByRole('progressbar', { name: 'chargement' })).exists();
  });
});
