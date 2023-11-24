import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | ComplementaryCertifications::AttachBadges::Badges::Header', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  test('it should display the header label with no tooltip by default', async function (assert) {
    // given & when
    const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::Header>
          LABEL
        </ComplementaryCertifications::AttachBadges::Badges::Header>
      `);

    // then
    assert.dom(screen.getByText('LABEL')).exists();
    assert.dom(screen.queryByRole('info')).doesNotExist();
    assert.dom(screen.queryByRole('tooltip')).doesNotExist();
  });

  test('it should display the tooltip if provided', async function (assert) {
    // given & when
    const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::Header>
          <:default>Label</:default>
          <:tooltip>A compléter</:tooltip>
        </ComplementaryCertifications::AttachBadges::Badges::Header>
      `);

    // then
    assert.dom(screen.getByRole('tooltip')).exists();
  });

  module('if header is required', function () {
    test('it should display the mandatory mark', async function (assert) {
      // given & when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::Header>
          LABEL
        </ComplementaryCertifications::AttachBadges::Badges::Header>
      `);

      // then
      assert.dom(screen.getByText('LABEL')).exists();
      assert.dom(screen.getByTitle('obligatoire')).exists();
    });
  });
});
