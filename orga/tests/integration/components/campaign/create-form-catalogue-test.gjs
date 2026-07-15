import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import CreateForm from 'pix-orga/components/campaign/create-form-catalogue';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm (catalogue)', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};
  const createCampaignSpy = (event) => {
    event.preventDefault();
  };
  const cancelSpy = () => {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
      features: {
        MULTIPLE_SENDING_ASSESSMENT: { active: false, params: null },
        COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: { active: false, params: null },
      },
    });

    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    data.prescriber = prescriber;
    data.defaultMembers = [prescriber];
    data.campaign = store.createRecord('campaign', { ownerId: prescriber.id });
    data.errors = {};
  });

  module('when grouping fields into sections', function () {
    test('it always displays a "Paramétrage" section containing the campaign goal field', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const settingsSection = screen.getByRole('heading', {
        name: t('pages.campaign-creation.settings.title'),
      }).parentElement;
      assert
        .dom(within(settingsSection).getByRole('radiogroup', { name: t('pages.campaign-creation.purpose.label') }))
        .exists();
    });

    test('it does not display the "Personnalisation" section until a course is selected for an assessment goal', async function (assert) {
      // given
      data.campaign.type = 'ASSESSMENT';

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.campaign-creation.customization.title') }))
        .doesNotExist();
    });

    test('it displays the "Personnalisation" section with the title and landing page fields once a course is selected for an assessment goal', async function (assert) {
      // given
      data.campaign.type = 'ASSESSMENT';
      data.campaign.course = this.owner
        .lookup('service:store')
        .createRecord('course', { name: 'targetProfile1', id: '123', type: 'targetProfile' });

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const customizationSection = screen.getByRole('heading', {
        name: t('pages.campaign-creation.customization.title'),
      }).parentElement;
      assert.dom(within(customizationSection).getByText(t('pages.campaign-creation.test-title.label'))).exists();
      assert
        .dom(
          within(customizationSection).getByLabelText(t('pages.campaign-creation.landing-page-text.label'), {
            exact: false,
          }),
        )
        .exists();
    });

    test('it displays the "Personnalisation" section with the landing page field for a profiles collection goal', async function (assert) {
      // given
      data.campaign.type = 'PROFILES_COLLECTION';

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const customizationSection = screen.getByRole('heading', {
        name: t('pages.campaign-creation.customization.title'),
      }).parentElement;
      assert
        .dom(
          within(customizationSection).getByLabelText(t('pages.campaign-creation.landing-page-text.label'), {
            exact: false,
          }),
        )
        .exists();
    });

    test('it never displays the "Personnalisation" section for a combined course goal', async function (assert) {
      // given
      data.campaign.type = 'COMBINED_COURSE';
      data.campaign.course = this.owner
        .lookup('service:store')
        .createRecord('course', { name: 'Mon parcours combiné', id: '123', type: 'blueprint' });

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.campaign-creation.customization.title') }))
        .doesNotExist();
    });
  });

  test('it displays campaign goals', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const fieldset = screen.getByRole('radiogroup', { name: t('pages.campaign-creation.purpose.label') });
    assert.strictEqual(within(fieldset).getAllByRole('radio').length, 3);
  });

  module('when no campaign goal is selected', function () {
    test('it disables the submit button if no course (other than profile collection) is selected', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const button = screen.getByRole('button', { name: t('pages.campaign-creation.actions.create') });
      assert.dom(button).hasAria('disabled', 'true');
    });

    test('it should not display any campaign goal fields', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
        .doesNotExist();
      assert.dom(screen.queryByRole('textbox', { name: t('pages.campaign-creation.name.label') })).doesNotExist();
    });
  });

  test('it enables the submit button when profile collection is selected', async function (assert) {
    data.campaign.type = 'PROFILES_COLLECTION';
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const button = screen.getByRole('button', { name: t('pages.campaign-creation.actions.create') });
    assert.dom(button).doesNotHaveAria('disabled');
  });

  test('[a11y] it displays a message that some inputs are required', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByText(t('common.form.mandatory-fields'), {
          exact: false,
        }),
      )
      .exists();
  });

  test('it has ASSESSMENT checked and displays its purpose explanation', async function (assert) {
    // given
    data.campaign.type = 'ASSESSMENT';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.assessment'))).isChecked();
    assert.dom(screen.getByText(t('pages.campaign-creation.purpose.assessment-info'))).exists();
  });

  test('it has combined course goal checked and displays its purpose explanation', async function (assert) {
    // given
    data.campaign.type = 'COMBINED_COURSE';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.combined-course'))).isChecked();
    assert.dom(screen.getByText(t('pages.campaign-creation.purpose.combined-course-info'))).exists();
  });

  test('it has PROFILES_COLLECTION checked', async function (assert) {
    // given
    data.campaign.type = 'PROFILES_COLLECTION';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.profiles-collection'))).isChecked();
  });

  test('it displays the purpose explanation of a profiles collection campaign', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.getByText(t('pages.campaign-creation.purpose.profiles-collection-info'))).exists();
    assert.dom(screen.queryByText(t('pages.campaign-creation.purpose.assessment-info'))).doesNotExist();
  });

  test('it not displays the explanation of automatic compute certificability if the feature is not activated', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.queryByRole('link', { name: 'Élèves' })).doesNotExist();
  });

  test('it displays the explanation of automatic compute certificability if the feature is activated', async function (assert) {
    // when
    data.prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY = { active: true, params: null };

    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.getByRole('link', { name: 'Élèves' })).exists();
  });

  test('it sends campaign creation action when submitted', async function (assert) {
    // given
    data.campaign.course = this.owner
      .lookup('service:store')
      .createRecord('course', { name: 'targetProfile1', id: '123', type: 'targetProfile' });
    const createCampaignSpy = sinon.stub();

    await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.assessment'));
    await fillByLabel(`${t('pages.campaign-creation.name.label')} *`, 'Ma campagne');

    // when
    await clickByName(t('pages.campaign-creation.actions.create'));

    sinon.assert.calledWithExactly(createCampaignSpy, data.campaign);
    // then
    assert.ok(true);
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
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.purpose-required'))).exists();
    });
  });
});
