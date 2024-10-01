import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Hero', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('global behaviour', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      class currentUserService extends Service {
        user = {
          firstName: 'Hermione',
        };
      }

      this.owner.register('service:currentUser', currentUserService);

      this.set('campaignParticipationResult', { masteryRate: 0.755 });

      // when
      screen = await render(
        hbs`
          <Campaigns::Assessment::SkillReview::EvaluationResultsHero
            @campaignParticipationResult={{this.campaignParticipationResult}}
          />`,
      );
    });

    test('it should display a congratulation title', async function (assert) {
      // then
      const title = screen.getByRole('heading', {
        name: t('pages.skill-review.hero.bravo', { name: 'Hermione' }),
      });
      assert.dom(title).exists();
    });

    test('it should display a rounded mastery rate', async function (assert) {
      // then
      const masteryRateElement = screen.getByText('76');
      assert.strictEqual(masteryRateElement.textContent, '76%');

      assert.dom(screen.getByText(t('pages.skill-review.hero.mastery-rate'))).exists();
    });
  });
});
