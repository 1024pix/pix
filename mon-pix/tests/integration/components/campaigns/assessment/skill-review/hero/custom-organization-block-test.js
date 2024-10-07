import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Skill Review | Evaluation Results Hero | Custom Organization Block',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('when organization custom text is defined', function () {
      test('it should display organization custom text', async function (assert) {
        // given
        this.set('customResultPageText', 'My custom result page text');

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::CustomOrganizationBlock
  @customResultPageText={{this.customResultPageText}}
/>`,
        );

        // then
        assert.dom(screen.getByText(t('pages.skill-review.organization-message'))).exists();
        assert.dom(screen.getByText('My custom result page text')).exists();
      });
    });

    module('when organization custom link url and label is defined', function () {
      test('it should display organization custom link', async function (assert) {
        // given
        this.set('customResultPageButtonUrl', 'https://pix.org/');
        this.set('customResultPageButtonText', 'My custom button');

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::CustomOrganizationBlock
  @customResultPageButtonUrl={{this.customResultPageButtonUrl}}
  @customResultPageButtonText={{this.customResultPageButtonText}}
/>`,
        );

        // then
        assert.dom(screen.getByText(t('pages.skill-review.organization-message'))).exists();
        assert.strictEqual(screen.getByRole('link', { name: 'My custom button' }).href, 'https://pix.org/');
      });
    });

    module('when no custom organization content is defined', function () {
      test('should not display the block', async function (assert) {
        // given
        this.set('customResultPageText', null);
        this.set('customResultPageButtonUrl', null);
        this.set('customResultPageButtonText', null);

        // when
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsHero::CustomOrganizationBlock
  @customResultPageText={{this.customResultPageText}}
  @customResultPageButtonUrl={{this.customResultPageButtonUrl}}
  @customResultPageButtonText={{this.customResultPageButtonText}}
/>`,
        );

        // then
        assert.dom(screen.queryByText(t('pages.skill-review.organization-message'))).doesNotExist();
      });
    });
  },
);
