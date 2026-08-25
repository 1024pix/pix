import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Trainings from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/trainings';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

function createManyTrainings(store, count) {
  return Array.from({ length: count }, (_, index) =>
    store.createRecord('training', {
      title: `Training ${index}`,
      link: 'https://exemple.net/',
      duration: { days: 2 },
    }),
  );
}

module('Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Trainings', function (hooks) {
  setupIntlRenderingTest(hooks);

  let observerCallback;
  let observerOptions;
  let observerInstance;

  hooks.beforeEach(function () {
    observerInstance = {
      observe: sinon.stub(),
      disconnect: sinon.stub(),
    };

    window.IntersectionObserver = function (callback, options) {
      observerCallback = callback;
      observerOptions = options;
      return observerInstance;
    };
  });

  hooks.afterEach(function () {
    delete window.IntersectionObserver;
  });

  test('it should display the trainings list', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const trainings = [
      store.createRecord('training', {
        title: 'Mon super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      }),
      store.createRecord('training', {
        title: 'Mon autre super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      }),
    ];

    // when
    const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

    // then
    assert
      .dom(screen.getByRole('heading', { name: t('pages.skill-review.recommended-engine.trainings.title') }))
      .isVisible();
    assert.dom(screen.getByText(t('pages.skill-review.recommended-engine.trainings.description'))).isVisible();
  });

  module('when the section becomes fully visible', function () {
    test('it calls @onFullyVisible', async function (assert) {
      // given
      const onFullyVisible = sinon.stub();
      const trainings = [];
      await render(<template><Trainings @trainings={{trainings}} @onFullyVisible={{onFullyVisible}} /></template>);

      // when
      observerCallback([{ isIntersecting: true }]);

      // then
      sinon.assert.calledOnce(onFullyVisible);
      assert.ok(true);
    });

    test('it observes the section with threshold 1', async function (assert) {
      // given
      const trainings = [];

      // when
      await render(<template><Trainings @trainings={{trainings}} /></template>);

      // then
      assert.strictEqual(observerOptions?.threshold, 1);
    });
  });

  test('it exposes the section as a region labelled by its title', async function (assert) {
    // given
    const trainings = [];

    // when
    await render(<template><Trainings @trainings={{trainings}} /></template>);

    // then
    const heading = document.querySelector('.results-recommendation-engine-training__title');
    const region = document.querySelector('.results-recommendation-engine-training');
    assert.strictEqual(region.getAttribute('aria-labelledby'), heading.id);
  });

  module('carousel navigation', function () {
    test('it does not render navigation buttons when there are 3 trainings or less', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const trainings = createManyTrainings(store, 3);

      // when
      const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
          }),
        )
        .doesNotExist();
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.previous-button-aria-label'),
          }),
        )
        .doesNotExist();
    });

    module('when there are more than 3 trainings', function () {
      test('it renders the navigation buttons with the previous button disabled', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 10);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        // then
        const previousButton = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.trainings.previous-button-aria-label'),
        });
        const nextButton = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
        });
        assert.dom(previousButton).hasAttribute('aria-disabled', 'true');
        assert.dom(nextButton).doesNotHaveAttribute('aria-disabled');
      });

      test('it locks manual scrolling on the list', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 10);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        // then
        const lists = screen.getAllByRole('list');
        assert.dom(lists[0]).hasClass('results-recommendation-engine-training__list--locked');
      });

      module('when clicking the next button', function () {
        test('it scrolls the list forward and enables the previous button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const trainings = createManyTrainings(store, 10);
          const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);
          const nextButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
          });

          // when
          await click(nextButton);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // then
          const lists = screen.getAllByRole('list');
          assert.notStrictEqual(lists[0].scrollLeft, 0);
          const previousButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.previous-button-aria-label'),
          });
          assert.dom(previousButton).doesNotHaveAttribute('aria-disabled');
        });
      });

      test('it announces the visible page to assistive technologies', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 10);
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);
        const nextButton = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
        });

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.skill-review.recommended-engine.trainings.pagination-announcement', {
                from: 1,
                to: 3,
                total: 10,
              }),
            ),
          )
          .exists();

        // when
        await click(nextButton);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.skill-review.recommended-engine.trainings.pagination-announcement', {
                from: 4,
                to: 6,
                total: 10,
              }),
            ),
          )
          .exists();
      });
    });
  });
});
