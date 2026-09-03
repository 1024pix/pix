import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import RecommendationButton from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/evaluation-results-hero-recommendation-engine/recommendation-button';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Recommendation Button',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it displays a see-recommended-trainings button', async function (assert) {
      // given & when
      const screen = await render(<template><RecommendationButton @hasTrainings={{true}} /></template>);

      // then
      assert
        .dom(await screen.findByRole('button', { name: t('pages.skill-review.hero.see-my-recommendations') }))
        .exists();
    });

    module('when there is an highlighted training', function () {
      test('it displays a see-recommended-trainings button with another label', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const highlightedTraining = store.createRecord('training', {
          title: 'title',
          internalTitle: 'internalTitle',
          link: 'my-training-link',
          type: 'webinaire',
          locales: ['fr-fr'],
          duration: { days: 2 },
        });

        // when
        const screen = await render(
          <template>
            <RecommendationButton @highlightedTraining={{highlightedTraining}} @hasTrainings={{true}} />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t('pages.skill-review.hero.see-my-other-recommendations') }))
          .exists();
      });
    });

    module('when clicking on the see-recommended-trainings button', function () {
      test('it calls the function passed as argument of onSeeRecommendationsButtonClicked', async function (assert) {
        // given
        const onSeeRecommendationsButtonClicked = sinon.stub();

        // when
        const screen = await render(
          <template>
            <RecommendationButton
              @hasTrainings={{true}}
              @onSeeRecommendationsButtonClicked={{onSeeRecommendationsButtonClicked}}
            />
          </template>,
        );
        await click(await screen.findByRole('button', { name: t('pages.skill-review.hero.see-my-recommendations') }));

        // then
        assert.ok(onSeeRecommendationsButtonClicked.calledOnce);
      });
    });
  },
);
