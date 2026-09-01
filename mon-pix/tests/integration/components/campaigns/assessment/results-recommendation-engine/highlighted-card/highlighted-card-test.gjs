import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import HighlightedCard from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/highlighted-card/highlighted-card';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | EvaluationResultsHeroRecommendationEngine | HighlightedCard',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it displays an highlighted card', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const training = store.createRecord('training', _buildTraining({}));

      // when
      const screen = await render(<template><HighlightedCard @highlightedTraining={{training}} /></template>);

      // then
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.highlighted-card.editor-label'))).exists();
      const editorNames = screen.getAllByText(training.editorName);
      assert.strictEqual(editorNames.length, 2);
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: t('pages.skill-review.recommended-engine.highlighted-card.title'),
          }),
        )
        .exists();
      assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.highlighted-card.subtitle'))).exists();
      const trainingTitles = screen.getAllByText(training.title);
      assert.strictEqual(trainingTitles.length, 2);
    });

    module('when user clicks on the button to discover the program', function () {
      test('should display a modal with training information', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const training = store.createRecord('training', _buildTraining({}));
        const onCardClickStub = sinon.stub();

        // when
        const screen = await render(
          <template><HighlightedCard @highlightedTraining={{training}} @onCardClick={{onCardClickStub}} /></template>,
        );
        await click(
          screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.highlighted-card.learn-more') }),
        );

        // then
        assert.dom(await screen.findByRole('dialog', { name: training.title })).exists();
      });
    });

    function _buildTraining({
      deliveryMode = 'remote',
      editorName = 'Pix',
      registrationRequired = true,
      title = 'Mon super training',
      type = 'webinaire',
      duration = { days: 1, hours: 2, minutes: 0 },
    }) {
      return {
        title,
        editorName,
        duration,
        type,
        deliveryMode,
        registrationRequired,
      };
    }
  },
);
