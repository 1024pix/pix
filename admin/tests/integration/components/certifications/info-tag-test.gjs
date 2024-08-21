import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import InfoTag from 'pix-admin/components/certifications/info-tag';
import { module, test } from 'qunit';

module('Integration | Component | certifications/info-tag', function (hooks) {
  setupRenderingTest(hooks);

  module('when certification is published', function () {
    test('it renders published tag', async function (assert) {
      // given
      const certification = { isPublished: true };

      // when
      const screen = await render(<template><InfoTag @record={{certification}} /></template>);

      // then
      assert.dom(screen.getByText('Publiée')).exists();
    });
  });

  module('when certification is not published', function () {
    test('it does not render published tag', async function (assert) {
      // given
      const certification = { isPublished: false };

      // when
      const screen = await render(<template><InfoTag @record={{certification}} /></template>);

      // then
      assert.dom(screen.queryByText('Publiée')).doesNotExist();
    });
  });

  module('when certification is cancelled', function () {
    test('it renders cancelled tag', async function (assert) {
      // given
      const certification = { isCancelled: true };

      // when
      const screen = await render(<template><InfoTag @record={{certification}} /></template>);

      // then
      assert.dom(screen.getByText('Annulée')).exists();
    });
  });

  module('when certification is not cancelled', function () {
    test('it does not render cancelled tag', async function (assert) {
      // given
      const certification = { isCancelled: false };

      // when
      const screen = await render(<template><InfoTag @record={{certification}} /></template>);

      // then
      assert.dom(screen.queryByText('Annulée')).doesNotExist();
    });
  });
});
