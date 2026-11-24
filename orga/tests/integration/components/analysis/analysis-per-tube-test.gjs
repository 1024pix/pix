import { render, within } from '@1024pix/ember-testing-library';
import AnalysisPerTube from 'pix-orga/components/analysis/analysis-per-tube';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | analysis-per-tube', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display analysis by tube for many participants', function () {
    test('it should display all tables', async function (assert) {
      // given
      const campaignAnalysisByTubesAndCompetence = {
        levelsPerCompetence: [
          {
            index: 1,
            name: 'mon super titre de competence 1',
            levelsPerTube: [],
          },
          {
            index: 2,
            name: 'mon super titre de competence 2',
            levelsPerTube: [],
          },
        ],
      };

      // when
      const screen = await render(
        <template><AnalysisPerTube @data={{campaignAnalysisByTubesAndCompetence}} /></template>,
      );

      // then
      assert.ok(screen.getByText(t('components.analysis-per-tube.description', { count: 2 })));
      assert.ok(screen.getByRole('table', { name: '1 - mon super titre de competence 1' }));
      assert.ok(screen.getByRole('table', { name: '2 - mon super titre de competence 2' }));
    });

    test('it should display content table', async function (assert) {
      // given
      const campaignAnalysisByTubesAndCompetence = {
        levelsPerCompetence: [
          {
            index: 1,
            name: 'mon super titre de competence 1',
            levelsPerTube: [
              { title: 'tube 1 cp 1', description: 'desc tube 1 cp 1', maxLevel: 8, meanLevel: 2 },
              { title: 'tube 2 cp 1', description: 'desc tube 2 cp 1', maxLevel: 4, meanLevel: 3.5 },
            ],
          },
          {
            index: 2,
            name: 'mon super titre de competence 2',
            levelsPerTube: [],
          },
        ],
      };

      // when
      const screen = await render(
        <template><AnalysisPerTube @data={{campaignAnalysisByTubesAndCompetence}} /></template>,
      );

      // then
      const filledTable = within(screen.getByRole('table', { name: '1 - mon super titre de competence 1' }));
      assert.strictEqual(filledTable.getAllByRole('row').length, 3);

      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-tube.table.column.tubes'),
        }),
      );
      assert.ok(filledTable.getByRole('cell', { name: 'tube 1 cp 1 desc tube 1 cp 1' }));

      assert.ok(
        filledTable.getByRole('cell', {
          name: t('components.analysis-per-tube.cover-rate-gauge-label', { reachedLevel: 2, maxLevel: 8, count: 2 }),
        }),
      );
      assert.ok(filledTable.getByRole('cell', { name: t('pages.statistics.level.novice') }));

      assert.ok(filledTable.getByRole('cell', { name: 'tube 2 cp 1 desc tube 2 cp 1' }));
      assert.ok(
        filledTable.getByRole('cell', {
          name: t('components.analysis-per-tube.cover-rate-gauge-label', { reachedLevel: 3.5, maxLevel: 4, count: 2 }),
        }),
      );
      assert.ok(filledTable.getByRole('cell', { name: t('pages.statistics.level.independent') }));

      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-tube.table.column.positioning'),
        }),
      );
      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-tube.table.column.level'),
        }),
      );

      const emptyTable = within(screen.getByRole('table', { name: '2 - mon super titre de competence 2' }));
      assert.strictEqual(emptyTable.getAllByRole('row').length, 1);
    });
  });

  module('display analysis by tube for one participants', function () {
    test('it should display adequate translations for one participant', async function (assert) {
      // given
      const campaignAnalysisByTubesAndCompetence = {
        levelsPerCompetence: [
          {
            index: 1,
            name: 'mon super titre de competence 1',
            levelsPerTube: [
              {
                title: 'tube 1 cp 1',
                description: 'desc tube 1 cp 1',
                maxLevel: 8,
                meanLevel: 2,
              },
            ],
          },
        ],
      };

      // when
      const screen = await render(
        <template>
          <AnalysisPerTube @data={{campaignAnalysisByTubesAndCompetence}} @isForParticipant={{true}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('components.analysis-per-tube.description', { count: 1 })));

      const filledTable = within(screen.getByRole('table', { name: '1 - mon super titre de competence 1' }));
      assert.ok(
        filledTable.getByRole('cell', {
          name: t('components.analysis-per-tube.cover-rate-gauge-label', { reachedLevel: 2, maxLevel: 8, count: 1 }),
        }),
      );
    });
  });
});
