import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Trainings from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/trainings';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

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
    sinon.restore();
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
});
