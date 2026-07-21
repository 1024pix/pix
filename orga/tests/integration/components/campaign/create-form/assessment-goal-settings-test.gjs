import { clickByName, render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AssessmentGoalSettings from 'pix-orga/components/campaign/create-form/assessment-goal-settings';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::AssessmentGoalSettings', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
      features: {
        MULTIPLE_SENDING_ASSESSMENT: { active: false, params: null },
        CAMPAIGN_WITHOUT_USER_PROFILE: { active: false, params: null },
      },
    });

    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    data.prescriber = prescriber;
    data.membersSortedByFullName = [prescriber];
    data.campaign = store.createRecord('campaign', { ownerId: prescriber.id, type: 'ASSESSMENT' });
    data.errors = {};
  });

  test('it hides owner, multiple-sendings and exam mode fields if no course is selected', async function (assert) {
    // given
    data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
    data.prescriber.features.CAMPAIGN_WITHOUT_USER_PROFILE = { active: true, params: null };

    // when
    const screen = await render(
      <template>
        <AssessmentGoalSettings
          @campaign={{data.campaign}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.membersSortedByFullName}}
        />
      </template>,
    );

    // then
    assert.dom(screen.queryByText(t('pages.campaign-creation.owner.info'))).doesNotExist();
    assert
      .dom(
        screen.queryByRole('radiogroup', {
          name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
        }),
      )
      .doesNotExist();
    assert.dom(screen.queryByText(t('pages.campaign-creation.exam-mode.label'))).doesNotExist();
  });

  module('when a course is selected', function (hooks) {
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      data.campaign.course = store.createRecord('course', {
        id: '1',
        name: 'targetProfile1',
        type: 'targetProfile',
        nbTubes: 3,
        isSimplifiedAccess: true,
      });
    });

    test("it displays owner fields and auto complete owner field with owner's full name", async function (assert) {
      // when
      const screen = await render(
        <template>
          <AssessmentGoalSettings
            @campaign={{data.campaign}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.membersSortedByFullName}}
          />
        </template>,
      );

      assert.dom(screen.getByText(t('pages.campaign-creation.owner.info'))).exists();
      await click(screen.getByLabelText(t('pages.campaign-creation.owner.label'), { exact: false }));
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Adam Troisjour', selected: true })).exists();
    });

    test('it fills multiple sendings fields when the feature is enabled', async function (assert) {
      // given
      data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
      data.campaign.multipleSendings = true;

      // when
      const screen = await render(
        <template>
          <AssessmentGoalSettings
            @campaign={{data.campaign}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.membersSortedByFullName}}
          />
        </template>,
      );

      // then
      const radiogroup = screen.getByRole('radiogroup', {
        name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
      });
      assert.dom(within(radiogroup).getByLabelText(t('pages.campaign-creation.yes'))).isChecked();
    });

    test('it does not display the exam mode field when the feature is not enabled', async function (assert) {
      // when
      const screen = await render(
        <template>
          <AssessmentGoalSettings
            @campaign={{data.campaign}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.membersSortedByFullName}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.exam-mode.label'))).doesNotExist();
    });

    module('when the exam mode feature is enabled', function (hooks) {
      hooks.beforeEach(function () {
        data.prescriber.features.CAMPAIGN_WITHOUT_USER_PROFILE = { active: true, params: null };
      });

      test('it displays the exam mode field and its explanation', async function (assert) {
        // when
        const screen = await render(
          <template>
            <AssessmentGoalSettings
              @campaign={{data.campaign}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.membersSortedByFullName}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t('pages.campaign-creation.exam-mode.label'))).exists();
        assert.dom(screen.getByText(t('pages.campaign-creation.purpose.exam-info'))).exists();
      });

      test("it sets the campaign's type to EXAM when the user activates the exam mode", async function (assert) {
        // given
        const screen = await render(
          <template>
            <AssessmentGoalSettings
              @campaign={{data.campaign}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.membersSortedByFullName}}
            />
          </template>,
        );

        // when
        const examModeField = screen.getByRole('radiogroup', { name: t('pages.campaign-creation.exam-mode.label') });
        await click(within(examModeField).getByRole('radio', { name: t('pages.campaign-creation.yes') }));

        // then
        assert.strictEqual(data.campaign.type, 'EXAM');
      });
    });

    test('it displays errors messages for name and external user id when they are empty', async function (assert) {
      // given
      data.errors = {
        name: [{ message: 'CAMPAIGN_NAME_IS_REQUIRED' }],
      };

      // when
      const screen = await render(
        <template>
          <AssessmentGoalSettings
            @campaign={{data.campaign}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.membersSortedByFullName}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.name-required'))).exists();
    });
  });
});
