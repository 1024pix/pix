import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByDay', function (hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let dataFetcher;

  hooks.beforeEach(async function () {
    // given
    this.set('campaignId', campaignId);

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByDay');
  });

  test('it should display statuses', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'started-participations': [],
          'shared-participations': [],
        },
      },
    });

    // when
    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @shouldDisplayAssessmentLabels={{true}} />`,
    );

    assert.strictEqual(screen.getAllByText(t('charts.participants-by-day.labels-a11y.date')).length, 2);
    assert.ok(screen.getByText(t('charts.participants-by-day.labels-a11y.started')));
    assert.ok(screen.getByText(t('charts.participants-by-day.labels-a11y.shared')));
  });

  test('it should display participants by day', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [{ day: '2021-06-01', count: '2' }],
        },
      },
    });

    // when
    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @shouldDisplayAssessmentLabels={{true}} />`,
    );

    const { startedTable, sharedTable } = getTables(screen);

    assert.ok(within(startedTable).getByText('1'));
    assert.ok(within(sharedTable).getByText('2'));
  });

  test('should start shared participations to 0 when there is at least one shared participant', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [{ day: '2021-06-02', count: '1' }],
        },
      },
    });

    // when
    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @shouldDisplayAssessmentLabels={{true}} />`,
    );

    const { sharedTable } = getTables(screen);

    assert.ok(within(getRowByCellValue(sharedTable, '01/06/2021')).getByRole('cell', { name: 0 }));
    assert.ok(within(getRowByCellValue(sharedTable, '02/06/2021')).getByRole('cell', { name: 1 }));
  });

  module('When last started participation is after the last shared one', () => {
    test('should add the last started participation to shared participations', async function (assert) {
      // given
      dataFetcher.withArgs(campaignId).resolves({
        data: {
          attributes: {
            'started-participations': [
              { day: '2021-06-01', count: '1' },
              { day: '2021-06-03', count: '2' },
            ],
            'shared-participations': [{ day: '2021-06-01', count: '1' }],
          },
        },
      });

      // when
      const screen = await render(
        hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @shouldDisplayAssessmentLabels={{true}} />`,
      );

      const { sharedTable } = getTables(screen);

      assert.ok(within(getRowByCellValue(sharedTable, '01/06/2021')).getByRole('cell', { name: 1 }));
      assert.ok(within(getRowByCellValue(sharedTable, '03/06/2021')).getByRole('cell', { name: 1 }));
    });
  });

  module('When last shared participation is after the last started one', () => {
    test('should add the last shared participation to started participations', async function (assert) {
      // given
      dataFetcher.withArgs(campaignId).resolves({
        data: {
          attributes: {
            'started-participations': [{ day: '2021-06-01', count: '2' }],
            'shared-participations': [
              { day: '2021-06-01', count: '1' },
              { day: '2021-06-03', count: '1' },
            ],
          },
        },
      });

      // when
      const screen = await render(
        hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @shouldDisplayAssessmentLabels={{true}} />`,
      );

      const { startedTable } = getTables(screen);

      assert.ok(within(getRowByCellValue(startedTable, '01/06/2021')).getByRole('cell', { name: 2 }));
      assert.ok(within(getRowByCellValue(startedTable, '03/06/2021')).getByRole('cell', { name: 2 }));
    });
  });
});

function getRowByCellValue(table, cellValue) {
  return within(table).getByRole('cell', { name: cellValue }).closest('tr');
}

function getTables(screen) {
  const startedTable = screen
    .getByRole('caption', { name: t('charts.participants-by-day.captions.started') })
    .closest('table');
  const sharedTable = screen
    .getByRole('caption', { name: t('charts.participants-by-day.captions.shared') })
    .closest('table');

  return { startedTable, sharedTable };
}
