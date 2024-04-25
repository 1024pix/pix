import { render } from '@1024pix/ember-testing-library';
import ImportCard from 'pix-orga/components/import-card';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | ImportCard', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should be render', async function (assert) {
    // given
    // when
    const screen = await render(
      <template>
        <ImportCard @cardTitle="card title">
          <:cardDetails>
            Details
          </:cardDetails>
          <:cardFooter>
            <button type="button">bouton</button>
          </:cardFooter>
        </ImportCard>
      </template>,
    );

    // then
    assert.ok(screen.getByText('card title'));
    assert.ok(screen.getByRole('button', { name: 'bouton' }));
    assert.ok(screen.getByText('Details'));
  });
});
