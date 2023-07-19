import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::Information', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display information on the current complementary certification's target profile", async function (assert) {
    // given & when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::Information />`);

    // then
    assert.dom(screen.getByText('TODO: Section infos')).exists();
  });
});
