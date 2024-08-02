import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Evaluation Results Rewards Tab | Badge', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('global badge behaviour', function () {
    test('it should display acquired badge content', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const acquiredBadge = store.createRecord('campaign-participation-badge', {
        title: 'Badge title',
        message: 'Congrats, you won a badge',
        isAcquired: true,
        isCertifiable: false,
      });

      this.set('badge', acquiredBadge);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
      );

      // then
      assert
        .dom(screen.getByRole('listitem', { name: this.intl.t('pages.skill-review.badge-card.acquired-full') }))
        .isVisible();

      assert.dom(screen.getByAltText('')).isVisible();
      assert.dom(screen.getByText(acquiredBadge.title)).isVisible();
      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.badge-card.certifiable')));
      assert.dom(screen.getByText(acquiredBadge.message)).isVisible();
    });

    module('when badge has a markdown message', function () {
      test('it should display the message as html', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const badge = store.createRecord('campaign-participation-badge', {
          message: '[markdown link](https://pix.fr)',
          isAcquired: true,
        });

        this.set('badge', badge);

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
        );

        // then
        assert.dom(screen.getByRole('link', { name: 'markdown link' })).isVisible();
      });
    });

    module('when badge is certifiable', function () {
      test('it should display a certifiable tag', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const certifiableBadge = store.createRecord('campaign-participation-badge', {
          isAcquired: true,
          isCertifiable: true,
        });

        this.set('badge', certifiableBadge);

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
        );

        // then
        assert.dom(screen.getByText(this.intl.t('pages.skill-review.badge-card.certifiable'))).isVisible();
      });
    });
  });

  module('when badge is not acquired', function () {
    test('it should display a progress bar', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const notAcquiredBadge = store.createRecord('campaign-participation-badge', {
        title: 'Badge title',
        message: 'Not acquired badge',
        isAcquired: false,
        isCertifiable: false,
        acquisitionPercentage: 60,
      });

      this.set('badge', notAcquiredBadge);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
      );

      // then
      assert
        .dom(screen.getByRole('listitem', { name: this.intl.t('pages.skill-review.badge-card.not-acquired-full') }))
        .isVisible();
      assert.dom(screen.getByAltText('')).isVisible();
      assert.dom(screen.getByText(notAcquiredBadge.title)).isVisible();
      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.badge-card.certifiable')));
      assert.dom(screen.getByText(notAcquiredBadge.message)).isVisible();
      assert.dom(screen.getByRole('progressbar')).isVisible();
    });

    module('when badge is certifiable', function () {
      test('it should display a certifiable tag', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const certifiableBadge = store.createRecord('campaign-participation-badge', {
          isAcquired: false,
          isCertifiable: true,
          acquisitionPercentage: 60,
        });

        this.set('badge', certifiableBadge);

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
        );

        // then
        assert.dom(screen.getByText(this.intl.t('pages.skill-review.badge-card.certifiable'))).isVisible();
      });
    });
  });

  module('when badge message is too long', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');

      const longMessage =
        'lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum, quia voluptate. Quam, voluptas. Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum, quia voluptate. Quam, voluptas.';

      const longMessageBadge = store.createRecord('campaign-participation-badge', {
        message: longMessage,
        isAcquired: true,
      });

      this.set('badge', longMessageBadge);

      // when
      screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards::Badge @badge={{this.badge}} />`,
      );
    });

    test('it should display a show-more button', async function (assert) {
      // then
      assert.ok(
        screen
          .getByText(/lorem ipsum dolor/)
          .parentNode.classList.toString()
          .includes('--shrinked'),
      );
      assert.dom(screen.getByRole('button', { name: this.intl.t('common.actions.show-more') })).isVisible();
    });

    test('it should toggle message ellispsis and button label', async function (assert) {
      // when
      await click(screen.queryByRole('button', { name: this.intl.t('common.actions.show-more') }));

      // then
      assert.strictEqual(screen.getByText(/lorem ipsum dolor/).parentNode.classList.length, 1);
      assert.dom(screen.getByRole('button', { name: this.intl.t('common.actions.show-less') })).isVisible();
    });
  });
});
