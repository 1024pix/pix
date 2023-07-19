import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::BadgesList', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display complementary certification's badges list", async function (assert) {
    // given & when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::BadgesList />`);

    // then
    assert.dom(screen.getByText('TODO: Section liste des résultats thématique')).exists();
  });
});
