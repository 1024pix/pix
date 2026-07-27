import { clickByName, clickByText, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import CampaignGoals from 'pix-orga/components/campaign/create-form/campaign-goals';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::CampaignGoals', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');

    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
      features: {
        COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: { active: false, params: null },
      },
    });

    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    data.prescriber = prescriber;
    data.campaign = store.createRecord('campaign');
    data.errors = {};
  });

  test('it displays campaign goals', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
      </template>,
    );

    // then
    const fieldset = screen.getByRole('radiogroup', { name: t('pages.campaign-creation.purpose.label') });
    assert.dom(within(fieldset).getByRole('radio', { name: t('pages.campaign-creation.purpose.assessment') })).exists();
    assert
      .dom(within(fieldset).getByRole('radio', { name: t('pages.campaign-creation.purpose.combined-course') }))
      .exists();
    assert
      .dom(within(fieldset).getByRole('radio', { name: t('pages.campaign-creation.purpose.profiles-collection') }))
      .exists();
  });

  test('it does not display COMBINED_COURSE campaign goal when hasBlueprints is false', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{false}} />
      </template>,
    );

    // then
    const fieldset = screen.getByRole('radiogroup', { name: t('pages.campaign-creation.purpose.label') });
    assert
      .dom(within(fieldset).queryByRole('radio', { name: t('pages.campaign-creation.purpose.combined-course') }))
      .doesNotExist();
  });

  test('it should not display course selection when no campaign goal is selected', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
      </template>,
    );

    // then
    assert
      .dom(screen.queryByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
      .doesNotExist();
  });

  module('when ASSESSMENT is selected', function () {
    test('it displays ASSESSMENT purpose explanation', async function (assert) {
      // given
      const screen = await render(
        <template>
          <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
        </template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.assessment'))).isChecked();
      assert.dom(screen.getByText(t('pages.campaign-creation.purpose.assessment-info'))).exists();
    });

    test('it redirects to /catalogue/targetProfile', async function (assert) {
      // given
      const screen = await render(
        <template>
          <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
        </template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert
        .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
        .hasAttribute('href', '/catalogue/targetProfile');
    });
  });

  module('when COMBINED_COURSE is selected', function () {
    test('it displays COMBINED_COURSE purpose explanation', async function (assert) {
      // given
      const screen = await render(
        <template>
          <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
        </template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.combined-course'));

      // then
      assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.combined-course'))).isChecked();
      assert.dom(screen.getByText(t('pages.campaign-creation.purpose.combined-course-info'))).exists();
    });

    test('it redirects to /catalogue/blueprint for course selection', async function (assert) {
      // given
      const screen = await render(
        <template>
          <CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} @hasBlueprints={{true}} />
        </template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.combined-course'));

      // then
      assert
        .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
        .hasAttribute('href', '/catalogue/blueprint');
    });
  });

  module('when PROFILES_COLLECTION is selected', function () {
    test('it displays PROFILES_COLLECTION purpose explanation', async function (assert) {
      // given
      const screen = await render(
        <template><CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.profiles-collection'))).isChecked();
      assert.dom(screen.getByText(t('pages.campaign-creation.purpose.profiles-collection-info'))).exists();
    });

    test('it does not display course selection', async function (assert) {
      // given
      const screen = await render(
        <template><CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
      );

      // when
      await clickByText(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
        .doesNotExist();
    });

    test('it doest not display the explanation of automatic compute certificability if the feature is not activated', async function (assert) {
      // given
      const screen = await render(
        <template><CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
      );

      // when
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.queryByRole('link', { name: 'Élèves' })).doesNotExist();
    });

    test('it displays the explanation of automatic compute certificability if the feature is activated', async function (assert) {
      // given
      data.prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY = { active: true, params: null };
      const screen = await render(
        <template><CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
      );

      // when
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByRole('link', { name: 'Élèves' })).exists();
    });
  });

  module('when there are errors', function () {
    test('it displays errors messages when the campaign purpose fields is empty', async function (assert) {
      // given
      const campaignWithErrors = EmberObject.create({
        errors: {
          type: [
            {
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            },
          ],
        },
      });

      data.errors = campaignWithErrors.errors;

      // when
      const screen = await render(
        <template><CampaignGoals @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.purpose-required'))).exists();
    });
  });
});
