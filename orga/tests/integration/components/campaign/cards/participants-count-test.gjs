import { render } from '@1024pix/ember-testing-library';
import ParticipantsCount from 'pix-orga/components/campaign/cards/participants-count';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::ParticipantsCount', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations count card', async function (assert) {
    const participantsCount = 10;

    const screen = await render(<template><ParticipantsCount @value={{participantsCount}} /></template>);

    assert.dom(screen.getByText(t('cards.participants-count.title'))).exists();
    assert.dom(screen.getByText('10')).exists();
  });
});
