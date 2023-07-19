import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::Log', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display logs for complementary certification's target profiles", async function (assert) {
    // given & when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::Log />`);

    // then
    assert.dom(screen.getByText('TODO: Section historique')).exists();
  });
});
