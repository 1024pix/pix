import { render } from '@1024pix/ember-testing-library';
import CompetenceRow from 'mon-pix/components/campaigns/assessment/results/evaluation-results-tabs/results-details/competence-row';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Results | EvaluationResultsTabs | ResultsDetails | CompetenceRow',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('competence icon', function () {
      test('when the competence is not found, it displays the pix-plus icon', async function (assert) {
        // given
        const competence = { id: 'unknownCompetenceId', name: 'Une compétence', masteryRate: 0.5 };

        // when
        await render(<template><CompetenceRow @competence={{competence}} /></template>);

        // then
        assert.dom('img').hasAttribute('src', '/images/icons/competences/pix-plus.svg');
      });

      test('when the competence is found, it displays the icon associated to the competence', async function (assert) {
        // given
        const competence = { id: 'recsvLz0W2ShyfD63', name: 'Mener une recherche', masteryRate: 0.5 };

        // when
        await render(<template><CompetenceRow @competence={{competence}} /></template>);

        // then
        assert.dom('img').hasAttribute('src', '/images/icons/competences/mener-une-recherche.svg');
      });
    });
  },
);
