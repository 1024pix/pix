import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import ListSummaryItems from 'pix-admin/components/target-profiles/list-summary-items';
import { module, test } from 'qunit';
module('Integration | Component | TargetProfiles::ListSummaryItems', function (hooks) {
  setupRenderingTest(hooks);

  const triggerFiltering = () => {};

  test('it should display target profile summary', async function (assert) {
    // given
    const summary = {
      id: 123,
      name: 'Profile Cible',
      oudated: false,
      isDisabled: true,
      createdAt: new Date('2021-01-01'),
    };

    const summaries = [summary];
    summaries.meta = { page: 1, pageSize: 1 };
    const id = undefined;
    const name = undefined;

    // when
    const screen = await render(
      <template>
        <ListSummaryItems @id={{id}} @summaries={{summaries}} @name={{name}} @triggerFiltering={{triggerFiltering}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('Profile Cible')).exists();
    assert.dom(screen.getByText('Actif')).exists();
    assert.dom(screen.getByText('01/01/2021')).exists();
    assert.dom(screen.getByText('Actif')).exists();
  });
});
