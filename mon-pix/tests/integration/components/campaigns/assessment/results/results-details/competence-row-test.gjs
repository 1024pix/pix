import { render } from '@1024pix/ember-testing-library';
import CompetenceRow from 'mon-pix/components/campaigns/assessment/results/evaluation-results-tabs/results-details/competence-row';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | EvaluationResultsTabs | ResultsDetails | CompetenceRow',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    const state = {};

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      this.owner.register('service:store', store);

      const competenceResult = store.createRecord('competence-result', {
        id: 'recsvLz0W2ShyfD63',
        name: 'Competence name',
        description: 'Description of competence',
        reachedStage: 2,
        masteryPercentage: 50,
      });

      state.competence = competenceResult;
      state.total = null;
    });

    test('it should render competence content', async function (assert) {
      // when
      const screen = await render(
        <template><CompetenceRow @competence={{state.competence}} @total={{state.total}} /></template>,
      );

      // then
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        '/images/icons/competences/mener-une-recherche.svg',
      );
      assert.dom(screen.getByRole('heading', { name: 'Competence name' })).exists();
      assert.dom(screen.getByText('Description of competence')).exists();
      assert.dom(screen.getByText('50 % de réussite')).exists();
    });

    module('when there is no total stages count', function () {
      test('it should not display stars', async function (assert) {
        // when
        const screen = await render(
          <template><CompetenceRow @competence={{state.competence}} @total={{state.total}} /></template>,
        );

        // then
        assert.dom(screen.queryByText('1 étoile acquise sur 3')).doesNotExist();
      });
    });

    module('when there is a total stages count', function () {
      test('it should display stars', async function (assert) {
        // given
        state.total = 3;

        // when
        const screen = await render(
          <template><CompetenceRow @competence={{state.competence}} @total={{state.total}} /></template>,
        );

        // then
        assert.dom(screen.getByText('1 étoile acquise sur 3')).exists();
      });
    });
  },
);
