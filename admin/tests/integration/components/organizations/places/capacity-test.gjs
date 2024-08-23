import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import Capacity from 'pix-admin/components/organizations/places/capacity';
import { module, test } from 'qunit';

module('Integration | Component | Organizations | Places | Capacity', function (hooks) {
  setupRenderingTest(hooks);

  module('Display places capacity', function () {
    test('it should display places capacity', async function (assert) {
      // given
      const placesCapacity = {
        categories: [
          { count: 10, category: 'FREE_RATE' },
          { count: 0, category: 'PUBLIC_RATE' },
          { count: 0, category: 'REDUCE_RATE' },
          { count: 0, category: 'SPECIAL_REDUCE_RATE' },
          { count: 7777, category: 'FULL_RATE' },
        ],
      };

      // when
      const screen = await render(<template><Capacity @placesCapacity={{placesCapacity}} /></template>);

      // then
      assert.dom(screen.queryByText('7777')).exists();
      assert.dom(screen.queryByText('Tarif plein')).exists();
      assert.dom(screen.queryByText('10')).exists();
      assert.dom(screen.queryByText('Tarif gratuit')).exists();

      assert.dom(screen.queryByText('Tarif public')).doesNotExist();
      assert.dom(screen.queryByText('Tarif réduit')).doesNotExist();
      assert.dom(screen.queryByText('Tarif réduit spécial')).doesNotExist();
    });
  });
});
