import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find, waitUntil } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
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
    const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

    // then
    assert
      .dom(screen.getByRole('region', { name: t('pages.skill-review.recommended-engine.trainings.title') }))
      .exists();
  });

  test('it exposes the section as a carousel, and each card as a labelled slide', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const trainings = createManyTrainings(store, 4);

    // when
    const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

    // then
    const region = await screen.findByRole('region', {
      name: t('pages.skill-review.recommended-engine.trainings.title'),
    });
    assert.strictEqual(
      region.getAttribute('aria-roledescription'),
      t('pages.skill-review.recommended-engine.trainings.carousel-roledescription'),
    );

    const slides = screen.getAllByRole('group');
    assert.strictEqual(slides.length, 3);
    assert.strictEqual(
      slides[0].getAttribute('aria-roledescription'),
      t('pages.skill-review.recommended-engine.trainings.slide-roledescription'),
    );
    assert.strictEqual(
      slides[0].getAttribute('aria-label'),
      t('pages.skill-review.recommended-engine.trainings.slide-aria-label', { position: 1, total: 4 }),
    );
    assert.strictEqual(
      slides[1].getAttribute('aria-label'),
      t('pages.skill-review.recommended-engine.trainings.slide-aria-label', { position: 2, total: 4 }),
    );
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
        const onNavigationButtonClick = sinon.stub();

        // when
        const screen = await render(
          <template>
            <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
          </template>,
        );

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

      module('when clicking the previous button', function () {
        test('it should call onNavigationButtonClick function passed as argument', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const trainings = createManyTrainings(store, 10);
          const onNavigationButtonClick = sinon.stub();

          // when
          const screen = await render(
            <template>
              <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
            </template>,
          );
          const nextButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
          });

          await click(nextButton);
          const lists = screen.getAllByRole('list');
          await waitUntil(() => lists[0].scrollLeft !== 0);

          const previousButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.previous-button-aria-label'),
          });
          await click(previousButton);

          // then
          sinon.assert.calledWith(onNavigationButtonClick, 'previous');
          assert.ok(true);
        });
      });

      module('when clicking the next button', function () {
        test('it scrolls the list forward and enables the previous button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const trainings = createManyTrainings(store, 10);
          const onNavigationButtonClick = sinon.stub();

          // when
          const screen = await render(
            <template>
              <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
            </template>,
          );
          const nextButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
          });
          await click(nextButton);
          const lists = screen.getAllByRole('list');
          await waitUntil(() => lists[0].scrollLeft !== 0);

          // then
          assert.notStrictEqual(lists[0].scrollLeft, 0);
          const previousButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.previous-button-aria-label'),
          });
          assert.dom(previousButton).doesNotHaveAttribute('aria-disabled');
        });
        test('it should call onNavigationButtonClick function passed as argument', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const trainings = createManyTrainings(store, 10);
          const onNavigationButtonClick = sinon.stub();

          // when
          const screen = await render(
            <template>
              <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
            </template>,
          );
          const nextButton = screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
          });
          await click(nextButton);

          // then
          sinon.assert.calledWith(onNavigationButtonClick, 'next');
          assert.ok(true);
        });
      });

      test('it announces the visible page to assistive technologies', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 10);
        const onNavigationButtonClick = sinon.stub();

        // when
        const screen = await render(
          <template>
            <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
          </template>,
        );
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

      test('it partially displays the upcoming card - clicking the button displays it in full and hides the previous cards', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 7);
        const onNavigationButtonClick = sinon.stub();

        // when
        const screen = await render(
          <template>
            <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
          </template>,
        );
        const nextButton = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
        });

        // clicks to the intermediate page (cards 3, 4, 5 + a peek of card 6)
        await click(nextButton);
        const lists = screen.getAllByRole('list');
        const cards = lists[0].children;
        const listRect = lists[0].getBoundingClientRect();
        await waitUntil(() => {
          const rect = cards[6].getBoundingClientRect();
          return rect.left < listRect.right && rect.right > listRect.right;
        });

        // then card 6 straddles the list's right edge, not fully shown
        const peekingLastCardRect = cards[6].getBoundingClientRect();

        assert.true(peekingLastCardRect.left < listRect.right);
        assert.true(peekingLastCardRect.right > listRect.right);

        assert.dom(nextButton).doesNotHaveAttribute('aria-disabled');

        // clicks to the final page
        const roundingTolerance = 1;
        await click(nextButton);
        await waitUntil(
          () =>
            cards[5].getBoundingClientRect().right <= listRect.left + roundingTolerance &&
            cards[6].getBoundingClientRect().right <= listRect.right + roundingTolerance,
        );

        // then card 6 is fully shown, alone, and card 5 is fully hidden
        const previousCardRect = cards[5].getBoundingClientRect();
        const lastCardRect = cards[6].getBoundingClientRect();

        assert.true(previousCardRect.right <= listRect.left + roundingTolerance);
        assert.true(lastCardRect.right <= listRect.right + roundingTolerance);

        const nextButtonOnFinalPage = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
        });
        assert.dom(nextButtonOnFinalPage).hasAttribute('aria-disabled', 'true');
      });
    });
  });

  module('carousel focus behaviour', function () {
    function getCardButtons(screen) {
      return screen.getAllByRole('button', {
        name: t('pages.skill-review.recommended-engine.training-card.aria-label'),
        hidden: true,
      });
    }

    test('it makes only the visible cards on the current page focusable', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const trainings = createManyTrainings(store, 10);

      // when
      const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

      // then
      const cardButtons = getCardButtons(screen);
      [0, 1, 2].forEach((index) => {
        assert.dom(cardButtons[index]).doesNotHaveAttribute('disabled');
      });
      [3, 4, 5, 6, 7, 8, 9].forEach((index) => {
        assert.dom(cardButtons[index]).hasAttribute('disabled');
      });
    });

    test('it updates focusable cards when navigating to the next page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const trainings = createManyTrainings(store, 10);
      const onNavigationButtonClick = sinon.stub();
      const screen = await render(
        <template>
          <Trainings @trainings={{trainings}} @onNavigationButtonClick={{onNavigationButtonClick}} />
        </template>,
      );
      const nextButton = screen.getByRole('button', {
        name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
      });

      // when
      await click(nextButton);
      const lists = screen.getAllByRole('list');
      await waitUntil(() => lists[0].scrollLeft !== 0);

      // then
      const cardButtons = getCardButtons(screen);
      [0, 1, 2].forEach((index) => {
        assert.dom(cardButtons[index]).hasAttribute('disabled');
      });
      [3, 4, 5].forEach((index) => {
        assert.dom(cardButtons[index]).doesNotHaveAttribute('disabled');
      });
      [6, 7, 8, 9].forEach((index) => {
        assert.dom(cardButtons[index]).hasAttribute('disabled');
      });
    });

    test('it makes all cards focusable when there is only one page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const trainings = createManyTrainings(store, 3);

      // when
      const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

      // then
      const cardButtons = getCardButtons(screen);
      cardButtons.forEach((button) => {
        assert.dom(button).doesNotHaveAttribute('disabled');
      });
    });
  });

  module('training cards a11y', function () {
    class MediaServiceStub extends Service {
      @tracked isMobile = false;
      @tracked isTablet = false;
      @tracked isDesktop = true;
    }

    module('when there is no navigations on page', function (hooks) {
      hooks.beforeEach(function () {
        this.owner.register('service:media', MediaServiceStub);
      });

      test('it does not set aria and role attributes', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 3);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        // then
        const region = screen.getByRole('region', { name: t('pages.skill-review.recommended-engine.trainings.title') });
        const [cards] = screen.getAllByRole('list');
        const slideWrapper = find('#results-recommendation-engine-training-list-item-0');

        assert.dom(region).doesNotHaveAttribute('aria-roledescription');
        assert.dom(cards).doesNotHaveAttribute('aria-live', 'polite');
        assert.dom(slideWrapper).doesNotHaveAttribute('role');
        assert.dom(slideWrapper).doesNotHaveAttribute('aria-roledescription');
        assert.dom(slideWrapper).doesNotHaveAttribute('aria-label');
      });
    });

    module('when navigations buttons are visible', function (hooks) {
      hooks.beforeEach(function () {
        this.owner.register('service:media', MediaServiceStub);
      });

      test('it sets aria and role attributes for carrousel a11y', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 4);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        // then
        const region = screen.getByRole('region', { name: t('pages.skill-review.recommended-engine.trainings.title') });
        const [cards] = screen.getAllByRole('list');
        const slides = within(region).getAllByRole('group');
        assert.strictEqual(
          region.getAttribute('aria-roledescription'),
          t('pages.skill-review.recommended-engine.trainings.carousel-roledescription'),
        );
        assert.dom(cards).hasAttribute('aria-live', 'polite');

        assert.strictEqual(slides.length, 3);

        for (let i = 0; i < slides.length; i++) {
          assert.strictEqual(
            slides[i].getAttribute('aria-roledescription'),
            t('pages.skill-review.recommended-engine.trainings.slide-roledescription'),
          );
          assert.strictEqual(
            slides[i].getAttribute('aria-label'),
            t('pages.skill-review.recommended-engine.trainings.slide-aria-label', { position: i + 1, total: 4 }),
          );
        }
      });
    });
  });

  module('responsive trainings per page', function () {
    class MediaServiceStub extends Service {
      @tracked isMobile = false;
      @tracked isTablet = false;
      @tracked isDesktop = false;
    }

    module('in tablet format', function () {
      test('it should display next button navigation for a carousel with 3 trainings cards', async function (assert) {
        // given
        this.owner.register('service:media', MediaServiceStub);
        const media = this.owner.lookup('service:media');
        media.isTablet = true;

        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 3);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
            }),
          )
          .exists();
      });
    });

    module('in mobile format', function () {
      test('it should display next button navigation for a carousel with 2 trainings cards', async function (assert) {
        // given
        this.owner.register('service:media', MediaServiceStub);
        const media = this.owner.lookup('service:media');
        media.isMobile = true;

        const store = this.owner.lookup('service:store');
        const trainings = createManyTrainings(store, 2);

        // when
        const screen = await render(<template><Trainings @trainings={{trainings}} /></template>);

        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.skill-review.recommended-engine.trainings.next-button-aria-label'),
            }),
          )
          .exists();
      });
    });
  });
});
