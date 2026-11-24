import { render, within } from '@1024pix/ember-testing-library';
import AnalysisPerCompetence from 'pix-orga/components/analysis/analysis-per-competence';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | analysis-per-competence', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display analysis by competence for many participants', function () {
    test('it should display content table', async function (assert) {
      // given
      const campaignAnalysisByTubesAndCompetence = {
        levelsPerCompetence: [
          {
            index: '3.2',
            name: 'Développer des documents multimedia',
            description: 'Développer des documents à contenu multimédia pour créer ses propres productions multimédia',
            maxLevel: 3,
            meanLevel: 1.1,
          },
          {
            index: '3.3',
            name: 'Sécuriser ses documents',
            description: 'Sécuriser ses documents efficacement',
            maxLevel: 5,
            meanLevel: 3,
          },
        ],
      };

      // when
      const screen = await render(
        <template><AnalysisPerCompetence @data={{campaignAnalysisByTubesAndCompetence}} /></template>,
      );

      // then
      assert.ok(screen.getByText(t('components.analysis-per-competence.description', { count: 2 })));

      const filledTable = within(
        screen.getByRole('table', { name: t('components.analysis-per-competence.table.caption') }),
      );

      assert.strictEqual(filledTable.getAllByRole('row').length, 3);

      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-competence.table.column.competences'),
        }),
      );
      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-competence.table.column.level'),
        }),
      );
      assert.ok(
        filledTable.getByRole('columnheader', {
          name: t('components.analysis-per-competence.table.column.positioning'),
        }),
      );

      assert.ok(
        filledTable.getByRole('cell', {
          name: '3.2 - Développer des documents multimedia Développer des documents à contenu multimédia pour créer ses propres productions multimédia',
        }),
      );

      assert.ok(
        filledTable.getByRole('cell', {
          name: t('components.analysis-per-competence.cover-rate-gauge-label', {
            reachedLevel: 1.1,
            maxLevel: 3,
            count: 2,
          }),
        }),
      );

      assert.ok(
        filledTable.getByRole('cell', {
          name: t('pages.statistics.level.novice'),
        }),
      );
    });
  });

  module('display analysis by competence for one participant', function () {
    test('it should display adequate translations for one participant', async function (assert) {
      // given
      const campaignAnalysisByTubesAndCompetence = {
        levelsPerCompetence: [
          {
            index: '3.2',
            name: 'Développer des documents multimedia',
            description: 'Développer des documents à contenu multimédia pour créer ses propres productions multimédia',
            maxLevel: 3,
            meanLevel: 1.1,
          },
        ],
      };

      // when
      const screen = await render(
        <template>
          <AnalysisPerCompetence @data={{campaignAnalysisByTubesAndCompetence}} @isForParticipant={{true}} />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('components.analysis-per-competence.description', { count: 1 })));

      const filledTable = within(
        screen.getByRole('table', { name: t('components.analysis-per-competence.table.caption') }),
      );
      assert.ok(
        filledTable.getByRole('cell', {
          name: t('components.analysis-per-competence.cover-rate-gauge-label', {
            reachedLevel: 1.1,
            maxLevel: 3,
            count: 1,
          }),
        }),
      );
    });
  });
});
