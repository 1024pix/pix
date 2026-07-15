import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import MultipleSendings from 'pix-orga/components/campaign/create-form/multiple-sendings';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::MultipleSendings', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
    data.labelKey = 'pages.campaign-creation.multiple-sendings.assessments.question-label';
    data.infoKey = 'pages.campaign-creation.multiple-sendings.assessments.info';
  });

  test('it displays the given wording', async function (assert) {
    // when
    const screen = await render(
      <template>
        <MultipleSendings @campaign={{data.campaign}} @labelKey={{data.labelKey}} @infoKey={{data.infoKey}} />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('radiogroup', {
          name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
        }),
      )
      .exists();
    assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.assessments.info'))).exists();
  });

  test('it checks "yes" when the campaign already allows multiple sendings', async function (assert) {
    // given
    data.campaign.multipleSendings = true;

    // when
    const screen = await render(
      <template>
        <MultipleSendings @campaign={{data.campaign}} @labelKey={{data.labelKey}} @infoKey={{data.infoKey}} />
      </template>,
    );

    // then
    const radiogroup = screen.getByRole('radiogroup', {
      name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
    });
    assert.dom(within(radiogroup).getByLabelText(t('pages.campaign-creation.yes'))).isChecked();
  });

  test('it updates campaign.multipleSendings when the user selects an option', async function (assert) {
    // given
    const screen = await render(
      <template>
        <MultipleSendings @campaign={{data.campaign}} @labelKey={{data.labelKey}} @infoKey={{data.infoKey}} />
      </template>,
    );

    // when
    const radiogroup = screen.getByRole('radiogroup', {
      name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
    });
    await click(within(radiogroup).getByLabelText(t('pages.campaign-creation.yes')));

    // then
    assert.true(data.campaign.multipleSendings);
  });

  test('it displays an additional info when knowledge elements are resettable', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    data.campaign.targetProfile = store.createRecord('target-profile', { areKnowledgeElementsResettable: true });

    // when
    const screen = await render(
      <template>
        <MultipleSendings @campaign={{data.campaign}} @labelKey={{data.labelKey}} @infoKey={{data.infoKey}} />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByText(t('pages.campaign-creation.multiple-sendings.knowledge-elements-resettable'), {
          exact: false,
        }),
      )
      .exists();
  });
});
