import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByStatus', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display status for assessment campaign', async function (assert) {
    this.participantCountByStatus = [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ];

    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{true}}
/>`,
    );
    assert
      .dom(screen.getByText(t('charts.participants-by-status.labels-legend.completed-assessment', { count: 1 })))
      .exists();
    assert
      .dom(screen.getByText(t('charts.participants-by-status.labels-legend.completed-profile', { count: 1 })))
      .exists();
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared', { count: 1 }))).exists();
  });

  test('it should contains tooltips for assessment campaign', async function (assert) {
    this.participantCountByStatus = [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ];

    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{true}}
/>`,
    );

    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.started-tooltip'))).exists();
    assert
      .dom(screen.getByText(t('charts.participants-by-status.labels-legend.completed-assessment-tooltip')))
      .exists();
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared-tooltip'))).exists();
  });

  test('it should display status for profile collection campaign', async function (assert) {
    this.participantCountByStatus = [
      ['completed', 1],
      ['shared', 1],
    ];

    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{false}}
/>`,
    );

    assert
      .dom(screen.queryByText(t('charts.participants-by-status.labels-legend.started', { count: 1 })))
      .doesNotExist();
    assert
      .dom(screen.getByText(t('charts.participants-by-status.labels-legend.completed-profile', { count: 1 })))
      .exists();
    assert
      .dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared-profile', { count: 1 })))
      .exists();
  });

  test('it should contains tooltips for profile collection campaign', async function (assert) {
    this.participantCountByStatus = [
      ['completed', 1],
      ['shared', 1],
    ];

    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{false}}
/>`,
    );

    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.completed-profile-tooltip'))).exists();
    assert.dom(screen.getByText(t('charts.participants-by-status.labels-legend.shared-profile-tooltip'))).exists();
  });
});
