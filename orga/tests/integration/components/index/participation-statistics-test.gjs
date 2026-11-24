import { render } from '@1024pix/ember-testing-library';
import IndexParticipationStatistics from 'pix-orga/components/index/participation-statistics';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Index::ParticipationStatistics', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participation statistics with real data', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const participationStatistics = store.createRecord('participation-statistic', {
      totalParticipationCount: 98,
      completedParticipationCount: 75,
      sharedParticipationCountLastThirtyDays: 42,
    });

    // when
    const screen = await render(
      <template><IndexParticipationStatistics @participationStatistics={{participationStatistics}} /></template>,
    );

    // then
    assert.dom(screen.getByText('77%')).exists();
    assert
      .dom(
        screen.getByText(
          t('components.index.participation-statistics.completion-rate.description', { completed: 75, started: 98 }),
        ),
      )
      .exists();

    assert.dom(screen.getByText('42')).exists();

    // Check titles and info texts
    assert.dom(screen.getByText(t('components.index.participation-statistics.completion-rate.title'))).exists();
    assert.dom(screen.getByText(t('components.index.participation-statistics.completion-rate.info'))).exists();
    assert
      .dom(screen.getByText(t('components.index.participation-statistics.completed-participations.title')))
      .exists();
    assert.dom(screen.getByText(t('components.index.participation-statistics.completed-participations.info'))).exists();
    assert
      .dom(screen.getByText(t('components.index.participation-statistics.completed-participations.description')))
      .exists();
  });

  test('it should handle zero participations', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const participationStatistics = store.createRecord('participation-statistic', {
      totalParticipationCount: 0,
      completedParticipationCount: 0,
      sharedParticipationCountLastThirtyDays: 0,
    });

    // when
    const screen = await render(
      <template><IndexParticipationStatistics @participationStatistics={{participationStatistics}} /></template>,
    );

    // then
    assert.dom(screen.getByText('-')).exists();
    assert.dom(screen.getByText(t('components.index.participation-statistics.completion-rate.no-activity'))).exists();
    assert.dom(screen.getByText('0')).exists();
  });

  test('it should handle null or undefined participation statistics', async function (assert) {
    // given
    const participationStatistics = null;

    // when
    const screen = await render(
      <template><IndexParticipationStatistics @participationStatistics={{participationStatistics}} /></template>,
    );

    // then
    // Should display default values when data is null
    assert.dom(screen.getByText('-')).exists();
    assert.dom(screen.getByText(t('components.index.participation-statistics.completion-rate.no-activity'))).exists();
    assert.dom(screen.getByText('0')).exists();

    // Check that titles and info are still displayed
    assert.dom(screen.getByText(t('components.index.participation-statistics.completion-rate.title'))).exists();
    assert
      .dom(screen.getByText(t('components.index.participation-statistics.completed-participations.title')))
      .exists();
  });
});
