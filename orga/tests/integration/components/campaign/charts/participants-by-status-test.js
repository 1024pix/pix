import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByStatus', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display statuses', async function (assert) {
    this.participantCountByStatus = [
      ['started', 1],
      ['shared', 1],
    ];

    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStatus @participantCountByStatus={{this.participantCountByStatus}} />`,
    );
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared', { count: 1 }))).exists();
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.started', { count: 1 }))).exists();
  });
});
