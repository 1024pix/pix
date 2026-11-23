import { render } from '@1024pix/ember-testing-library';
import ParticipantsByStatus from 'pix-orga/components/campaign/charts/participants-by-status';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByStatus', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display statuses', async function (assert) {
    const participantCountByStatus = [
      ['started', 1],
      ['shared', 1],
    ];

    const screen = await render(
      <template><ParticipantsByStatus @participantCountByStatus={{participantCountByStatus}} /></template>,
    );
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared', { count: 1 }))).exists();
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.started', { count: 1 }))).exists();
  });
});
