import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Results | Evaluation Results Hero | Acquired Badges',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it should display a list of acquired badges', async function (assert) {
      // given
      const acquiredBadge1 = {
        altMessage: 'alt message 1',
        isAcquired: true,
        imageUrl: '/images/background/hexa-pix.svg',
        title: 'Acquired badge 1',
      };
      const acquiredBadge2 = {
        altMessage: 'alt message 2',
        isAcquired: true,
        imageUrl: '/images/background/hexa-pix.svg',
        title: 'Acquired badge 2',
      };

      this.set('badges', [acquiredBadge1, acquiredBadge2]);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::AcquiredBadges @acquiredBadges={{this.badges}} />`,
      );

      // then
      const badgesTitle = screen.getByRole('heading', {
        name: t('pages.skill-review.hero.acquired-badges-title'),
      });
      assert.dom(badgesTitle).exists();

      const badgesList = badgesTitle.nextElementSibling;
      assert.dom(badgesList).exists();

      assert.strictEqual(within(badgesList).getAllByRole('listitem').length, 2);

      assert.dom(within(badgesList).getByRole('img', { name: acquiredBadge1.altMessage })).exists();
      assert.dom(within(badgesList).getByRole('img', { name: acquiredBadge2.altMessage })).exists();

      assert.dom(within(badgesList).getByText(acquiredBadge1.title)).exists();
      assert.dom(within(badgesList).getByText(acquiredBadge2.title)).exists();
    });

    test('it should display certifiable acquired badges first', async function (assert) {
      // given
      const acquiredBadge = {
        isAcquired: true,
        isCertifiable: false,
        imageUrl: '/images/background/hexa-pix.svg',
        title: 'Acquired badge',
      };
      const acquiredCertifiableBadge = {
        isAcquired: true,
        isCertifiable: true,
        imageUrl: '/images/background/hexa-pix.svg',
        title: 'Acquired and certifiable badge',
      };

      this.set('badges', [acquiredBadge, acquiredCertifiableBadge]);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::AcquiredBadges @acquiredBadges={{this.badges}} />`,
      );

      // then
      const acquiredBadges = screen.getAllByRole('listitem');
      assert.strictEqual(acquiredBadges.length, 2);
      assert.strictEqual(screen.getAllByText(t('pages.skill-review.badge-card.certifiable')).length, 1);
      assert.dom(within(acquiredBadges[0]).getByText(t('pages.skill-review.badge-card.certifiable')));
    });
  },
);
