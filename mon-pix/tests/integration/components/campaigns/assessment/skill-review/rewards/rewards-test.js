import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Evaluation Results Tabs | Rewards', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display acquired and not acquired badges', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const badgeAcquired1 = store.createRecord('campaign-participation-badge', {
      isAcquired: true,
    });

    const badgeAcquired2 = store.createRecord('campaign-participation-badge', {
      isAcquired: true,
    });

    const badgeNotAcquired1 = store.createRecord('campaign-participation-badge', {
      isAcquired: false,
      acquisitionPercentage: 30,
    });

    const badgeNotAcquired2 = store.createRecord('campaign-participation-badge', {
      isAcquired: false,
      acquisitionPercentage: 70,
    });

    this.set('badges', [badgeAcquired1, badgeAcquired2, badgeNotAcquired1, badgeNotAcquired2]);

    // when
    const screen = await render(
      hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards @badges={{this.badges}} />`,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: this.intl.t('pages.skill-review.tabs.rewards.title') })).isVisible();
    assert.dom(screen.getByText(this.intl.t('pages.skill-review.tabs.rewards.description'))).isVisible();

    assert
      .dom(screen.getByRole('heading', { name: this.intl.t('pages.skill-review.badge-card.acquired') }))
      .isVisible();
    assert.strictEqual(
      screen.getAllByRole('listitem', { name: this.intl.t('pages.skill-review.badge-card.acquired-full') }).length,
      2,
    );

    assert
      .dom(screen.getByRole('heading', { name: this.intl.t('pages.skill-review.badge-card.not-acquired') }))
      .isVisible();
    assert.strictEqual(
      screen.getAllByRole('listitem', { name: this.intl.t('pages.skill-review.badge-card.not-acquired-full') }).length,
      2,
    );
  });

  module('in acquired badges list', function () {
    test('it should display certifiable badge first', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const acquiredBadge = store.createRecord('campaign-participation-badge', {
        isAcquired: true,
        isCertifiable: true,
      });

      const notCertifiableBadge1 = store.createRecord('campaign-participation-badge', {
        isAcquired: true,
        isCertifiable: false,
      });
      const notCertifiableBadge2 = store.createRecord('campaign-participation-badge', {
        isAcquired: true,
        isCertifiable: false,
      });

      this.set('badges', [notCertifiableBadge1, acquiredBadge, notCertifiableBadge2]);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards @badges={{this.badges}} />`,
      );

      // then
      const acquiredBadges = screen.getAllByRole('listitem', {
        name: this.intl.t('pages.skill-review.badge-card.acquired-full'),
      });
      const firstBadgeItem = acquiredBadges[0];

      assert.strictEqual(
        screen.getByText(this.intl.t('pages.skill-review.badge-card.certifiable')).closest('li'),
        firstBadgeItem,
      );
    });
  });

  module('in not acquired badges list', function () {
    test('it should display certifiable badge first', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const certifiableBadge = store.createRecord('campaign-participation-badge', {
        isAcquired: false,
        isCertifiable: true,
        acquisitionPercentage: 60,
      });

      const notCertifiableBadge1 = store.createRecord('campaign-participation-badge', {
        isAcquired: false,
        isCertifiable: false,
        acquisitionPercentage: 60,
      });
      const notCertifiableBadge2 = store.createRecord('campaign-participation-badge', {
        isAcquired: false,
        isCertifiable: false,
        acquisitionPercentage: 60,
      });

      this.set('badges', [notCertifiableBadge1, certifiableBadge, notCertifiableBadge2]);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Rewards @badges={{this.badges}} />`,
      );

      // then
      const notAcquiredBadges = screen.getAllByRole('listitem', {
        name: this.intl.t('pages.skill-review.badge-card.not-acquired-full'),
      });
      const firstBadgeItem = notAcquiredBadges[0];

      assert.strictEqual(
        screen.getByText(this.intl.t('pages.skill-review.badge-card.certifiable')).closest('li'),
        firstBadgeItem,
      );
    });
  });
});
