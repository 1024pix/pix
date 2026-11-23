import { render, within } from '@1024pix/ember-testing-library';
import ParticipantsByMasteryPercentage from 'pix-orga/components/campaign/charts/participants-by-mastery-percentage';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByMasteryPercentage', function (hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let dataFetcher;
  let distributions;

  hooks.beforeEach(async function () {
    // given
    distributions = [
      { masteryRate: '0.00', count: 2 },
      { masteryRate: '0.10', count: 1 },
      { masteryRate: '0.11', count: 1 },
      { masteryRate: '0.20', count: 1 },
      { masteryRate: '0.55', count: 4 },
      { masteryRate: '0.90', count: 1 },
      { masteryRate: '1.00', count: 5 },
    ];

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByMasteryRate');

    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'result-distribution': distributions,
        },
      },
    });
  });

  test('it should display chart for participation distribution', async function (assert) {
    // given && when
    const screen = await render(<template><ParticipantsByMasteryPercentage @campaignId={{campaignId}} /></template>);

    // then
    assert.ok(screen.getByText(t('charts.participants-by-mastery-percentage.title')));
  });

  test('it should display repartition on list', async function (assert) {
    // given && when
    const screen = await render(<template><ParticipantsByMasteryPercentage @campaignId={{campaignId}} /></template>);

    // then
    const list = screen.getByRole('list');
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0, to: 0.1, count: 3 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.11, to: 0.2, count: 2 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.21, to: 0.3, count: 0 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.31, to: 0.4, count: 0 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.41, to: 0.5, count: 0 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.51, to: 0.6, count: 4 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.61, to: 0.7, count: 0 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.71, to: 0.8, count: 0 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.81, to: 0.9, count: 1 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
    assert.ok(
      within(list).getByText(
        t('charts.participants-by-mastery-percentage.label-a11y', { from: 0.91, to: 1, count: 5 }),
        {
          trim: false,
          collapseWhitespace: false,
        },
      ),
    );
  });
});
