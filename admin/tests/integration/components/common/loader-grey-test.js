import { render as renderScreen } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component |  common/loader-grey', function (hooks) {
  setupRenderingTest(hooks);

  test('should display a loader', async function (assert) {
    // given

    //  when
    const screen = await renderScreen(hbs`<Common::LoaderGrey />`);

    // then
    assert.dom(screen.getByRole('progressbar', { name: 'chargement' })).exists();
  });
});
