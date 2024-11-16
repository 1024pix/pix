import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Results | Evaluation Results Hero | Custom Organization Block',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('displays the block title', async function (assert) {
      // given
      this.set('campaign', {});

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock @campaign={{this.campaign}} />`,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.organization-message'))).exists();
    });

    module('custom text', function () {
      module('when organization custom text is defined', function () {
        test('displays organization custom text', async function (assert) {
          // given
          const customResultPageText = 'My custom result page text';

          this.set('campaign', {
            customResultPageText,
          });

          // when
          const screen = await render(
            hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock @campaign={{this.campaign}} />`,
          );

          // then
          assert.dom(screen.getByText(customResultPageText)).exists();
        });
      });

      module('when organization custom text is not defined', function () {
        test('not display organization custom text', async function (assert) {
          // given
          this.set('campaign', {
            customResultPageText: null,
          });

          // when
          const screen = await render(
            hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock @campaign={{this.campaign}} />`,
          );

          // then
          assert.dom(screen.queryByRole('paragraph')).doesNotExist();
        });
      });
    });

    module('custom button', function () {
      module('when organization custom link url and label are defined', function () {
        test('displays organization custom link', async function (assert) {
          // given
          const customResultPageButtonUrl = 'https://pix.org/';
          const customResultPageButtonText = 'My custom button';

          this.set('campaign', {
            customResultPageButtonUrl,
            customResultPageButtonText,
          });

          this.set('campaignParticipationResult', {
            masteryRate: 0.75,
          });

          // when
          const screen = await render(
            hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock
  @campaign={{this.campaign}}
  @campaignParticipationResult={{this.campaignParticipationResult}}
/>`,
          );

          // then
          assert.strictEqual(
            screen.getByRole('link', { name: customResultPageButtonText }).href,
            `${customResultPageButtonUrl}?masteryPercentage=75`,
          );
        });
      });

      module('when organization custom link url is defined but label is not', function () {
        test('not display organization custom link', async function (assert) {
          // given
          const customResultPageButtonUrl = 'https://pix.org/';

          this.set('campaign', {
            customResultPageButtonUrl,
          });

          // when
          const screen = await render(
            hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock @campaign={{this.campaign}} />`,
          );

          // then
          assert.dom(screen.queryByRole('link')).doesNotExist();
        });
      });

      module('when organization custom link label is defined but url is not', function () {
        test('not display organization custom link', async function (assert) {
          // given

          this.set('campaign', {
            customResultPageButtonUrl: null,
            customResultPageButtonText: 'Some custom button text',
          });

          // when
          const screen = await render(
            hbs`<Campaigns::Assessment::Results::EvaluationResultsHero::CustomOrganizationBlock @campaign={{this.campaign}} />`,
          );

          // then
          assert.dom(screen.queryByRole('link')).doesNotExist();
        });
      });
    });
  },
);
