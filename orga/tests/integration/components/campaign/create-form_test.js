import { module, test } from 'qunit';
import sinon from 'sinon';
import {
  fillByLabel,
  clickByName,
  render as renderScreen,
  selectByLabelAndOption,
} from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | Campaign::CreateForm', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  const prescriber = EmberObject.create({ fullName: 'Adam Troisjour', id: 1 });
  const defaultMembers = [prescriber];

  hooks.beforeEach(function () {
    this.createCampaignSpy = (event) => {
      event.preventDefault();
    };
    this.cancelSpy = () => {};
    this.errors = {};
    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }
    this.owner.register('service:current-user', CurrentUserStub);
    this.set('defaultMembers', defaultMembers);
  });

  test('it should contain inputs, attributes and validation button', async function (assert) {
    // when
    await renderScreen(
      hbs`<Campaign::CreateForm
        @onSubmit={{createCampaignSpy}}
        @onCancel={{cancelSpy}}
        @errors={{errors}}
        @membersSortedByFullName={{this.defaultMembers}} />`
    );

    // then
    assert.contains(t('pages.campaign-creation.name.label'));
    assert.dom('button[type="submit"]').exists();
    assert.dom('input[type=text]').hasAttribute('maxLength', '255');
    assert.dom('textarea').hasAttribute('maxLength', '5000');
  });

  test('it should display block information for owner', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::CreateForm
        @onSubmit={{createCampaignSpy}}
        @onCancel={{cancelSpy}}
        @errors={{errors}}
        @membersSortedByFullName={{this.defaultMembers}} />`
    );

    // then
    assert.dom(screen.getByText(t('pages.campaign-creation.owner.info'))).exists();
    assert.dom(screen.getByText(t('pages.campaign-creation.owner.title'))).exists();
  });

  test("it should auto complete owner field with current user's full name", async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::CreateForm
        @onSubmit={{createCampaignSpy}}
        @onCancel={{cancelSpy}}
        @errors={{errors}}
        @membersSortedByFullName={{this.defaultMembers}} />`
    );

    // then
    assert.dom(screen.getByTitle('Adam Troisjour')).exists();
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::CreateForm
        @onSubmit={{createCampaignSpy}}
        @onCancel={{cancelSpy}}
        @errors={{errors}}
        @membersSortedByFullName={{this.defaultMembers}} />`
    );

    // then
    assert.dom(screen.getByText(t('common.form.mandatory-fields'))).exists();
  });

  module('when user choose to create a campaign of type ASSESSMENT', function () {
    test('it should display fields for campaign title and target profile', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}}/>`
      );
      await clickByName(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.contains(t('pages.campaign-creation.test-title.label'));
      assert.contains(t('pages.campaign-creation.purpose.label'));
    });

    test('it should display the purpose explanation of an assessment campaign', async function (assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @campaign={{campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.contains(t('pages.campaign-creation.purpose.assessment-info'));
      assert.notContains(t('pages.campaign-creation.purpose.profiles-collection-info'));
    });

    test('it should not display multiple sendings field', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );

      // then
      assert.notContains(t('pages.campaign-creation.multiple-sendings.question-label'));
      assert.notContains(t('pages.campaign-creation.multiple-sendings.info'));
    });

    module('when there are several target profiles associated to the organization', function () {
      test('it should display the all category tags', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '4',
            name: 'targetProfile4',
            description: 'description4',
            category: 'SUBJECT',
          }),
          EmberObject.create({
            id: '5',
            name: 'targetProfile5',
            description: 'description7',
            category: 'OTHER',
          }),
        ];
        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}} @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));

        // then
        assert.contains(t('pages.campaign-creation.tags-title'));
        assert.contains(t('pages.campaign-creation.tags.SUBJECT'));
        assert.contains(t('pages.campaign-creation.tags.OTHER'));
      });

      test('it should display each category tags once', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '4',
            name: 'targetProfile4',
            description: 'description4',
            category: 'SUBJECT',
          }),
          EmberObject.create({
            id: '4',
            name: 'targetProfile6',
            description: 'description6',
            category: 'SUBJECT',
          }),
          EmberObject.create({
            id: '5',
            name: 'targetProfile5',
            description: 'description7',
            category: 'OTHER',
          }),
        ];

        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}} @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));
        // then
        assert.contains(t('pages.campaign-creation.tags-title'));
        assert.dom('label[for="SUBJECT"]').exists({ count: 1 });
        assert.contains(t('pages.campaign-creation.tags.OTHER'));
      });

      test('it should display only the target profiles associated to the tag selected', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '4',
            name: 'targetProfile4',
            description: 'description4',
            category: 'SUBJECT',
          }),
          EmberObject.create({
            id: '5',
            name: 'targetProfile5',
            description: 'description7',
            category: 'OTHER',
          }),
        ];
        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}} @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));
        await clickByName(t('pages.campaign-creation.tags.SUBJECT'));
        // then
        const option = document.getElementsByTagName('option');
        assert.strictEqual(option.length, 1);
        assert.strictEqual(option[0].label, 'targetProfile4');
      });
    });

    module('when there is no target profiles associated to the organization', function () {
      test('it should not display the category tags', async function (assert) {
        // given
        this.targetProfiles = [];

        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));

        // then
        assert.notContains(t('pages.campaign-creation.tags-title'));
      });
    });

    module('when the user chose a target profile', function () {
      test('it should display informations about target profile', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
            tubeCount: 11,
            thematicResultCount: 12,
            hasStage: true,
          }),
          EmberObject.create({
            id: '2',
            name: 'targetProfile2',
            description: 'description2',
            tubeCount: 21,
            thematicResultCount: 22,
            hasStage: false,
          }),
        ];

        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));
        await selectByLabelAndOption(t('pages.campaign-creation.target-profiles-list-label'), 'targetProfile1');

        // then
        assert.contains('description1');
        assert.contains(t('common.target-profile-details.subjects', { value: 11 }));
        assert.contains(t('common.target-profile-details.thematic-results', { value: 12 }));
      });

      test('it should display a message about result', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
            tubeCount: 11,
            thematicResultCount: 12,
            hasStage: true,
          }),
          EmberObject.create({
            id: '2',
            name: 'targetProfile2',
            description: 'description2',
            tubeCount: 21,
            thematicResultCount: 22,
            hasStage: false,
          }),
        ];

        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));
        await selectByLabelAndOption(t('pages.campaign-creation.target-profiles-list-label'), 'targetProfile1');

        // then
        assert.contains(t('common.target-profile-details.results.common'));
      });
    });

    module('chevron', function () {
      test('should display chevron', async function (assert) {
        // given
        this.targetProfiles = [
          EmberObject.create({
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
          }),
        ];

        // when
        await renderScreen(
          hbs`<Campaign::CreateForm
            @targetProfiles={{targetProfiles}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{errors}}
            @membersSortedByFullName={{this.defaultMembers}} />`
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));

        // then
        assert.dom(`[aria-label="${this.intl.t('pages.campaign-creation.target-profiles.chevron')}"]`).exists();
      });
    });

    module('when the user wants to clear the content of the target profile input', function (hooks) {
      hooks.beforeEach(function () {
        this.targetProfiles = [
          EmberObject.create({
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
          }),
        ];
      });

      module('when the target profile input is empty', function () {
        test('should not display the button to clear the input', async function (assert) {
          await renderScreen(
            hbs`<Campaign::CreateForm
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{errors}}
              @membersSortedByFullName={{this.defaultMembers}} />`
          );
          await clickByName(t('pages.campaign-creation.purpose.assessment'));

          assert.notContains(t('pages.campaign-creation.actions.delete'));
        });
      });

      module('when the target profile input is filled', function () {
        test('should display the button to clear the input', async function (assert) {
          await renderScreen(
            hbs`<Campaign::CreateForm
              @targetProfiles={{targetProfiles}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{errors}}
              @membersSortedByFullName={{this.defaultMembers}} />`
          );
          await clickByName(t('pages.campaign-creation.purpose.assessment'));
          await fillByLabel(`* ${t('pages.campaign-creation.target-profiles-list-label')}`, 'pro');

          assert.contains(t('pages.campaign-creation.actions.delete'));
        });

        test('should clear the input after the click on the delete button', async function (assert) {
          await renderScreen(
            hbs`<Campaign::CreateForm
              @targetProfiles={{targetProfiles}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{errors}}
              @membersSortedByFullName={{this.defaultMembers}} />`
          );
          await clickByName(t('pages.campaign-creation.purpose.assessment'));
          await fillByLabel(`* ${t('pages.campaign-creation.target-profiles-list-label')}`, 'pro');
          await clickByName(t('pages.campaign-creation.actions.delete'));

          assert.dom('input[aria-describedby="target-profile-info"]').containsText('');
        });

        test('should not display target profile informations after the click on the delete button', async function (assert) {
          await renderScreen(
            hbs`<Campaign::CreateForm
              @targetProfiles={{targetProfiles}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{errors}}
              @membersSortedByFullName={{this.defaultMembers}} />`
          );
          await clickByName(t('pages.campaign-creation.purpose.assessment'));
          await selectByLabelAndOption(t('pages.campaign-creation.target-profiles-list-label'), 'targetProfile1');
          await clickByName(t('pages.campaign-creation.actions.delete'));

          assert.notContains('description1');
        });
      });
    });
  });

  module('when user choose to create a campaign of type PROFILES_COLLECTION', () => {
    test('it should not display fields for campaign title and target profile', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.notContains(t('pages.campaign-creation.test-title.label'));
      assert.notContains(t('pages.campaign-creation.target-profiles-list-label'));
    });

    test('it should display fields for enabling multiple sendings', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.contains(t('pages.campaign-creation.multiple-sendings.question-label'));
      assert.contains(t('pages.campaign-creation.multiple-sendings.info'));
    });

    test('it should display the purpose explanation of a profiles collection campaign', async function (assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @campaign={{campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.contains(t('pages.campaign-creation.purpose.profiles-collection-info'));
      assert.notContains(t('pages.campaign-creation.purpose.assessment-info'));
    });
  });

  module('when user has not chosen yet to ask or not an external user ID', function () {
    test('it should not display gdpr footnote', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );

      // then
      assert.notContains(t('pages.campaign-creation.legal-warning'));
    });
  });

  module('when user choose not to ask an external user ID', function () {
    test('it should not display gdpr footnote either', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.no'));

      // then
      assert.notContains(t('pages.campaign-creation.legal-warning'));
    });
  });

  module('when user choose to ask an external user ID', function () {
    test('it should display gdpr footnote', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.contains(t('pages.campaign-creation.legal-warning'));
    });
  });

  test('it should send campaign creation action when submitted', async function (assert) {
    // given
    this.targetProfiles = [{ name: 'targetProfile1' }];
    this.createCampaignSpy = sinon.stub();

    await renderScreen(
      hbs`<Campaign::CreateForm
        @onSubmit={{createCampaignSpy}}
        @onCancel={{cancelSpy}}
        @errors={{errors}}
        @targetProfiles={{this.targetProfiles}}
        @membersSortedByFullName={{this.defaultMembers}} />`
    );
    await fillByLabel(`* ${t('pages.campaign-creation.name.label')}`, 'Ma campagne');
    await clickByName(t('pages.campaign-creation.purpose.assessment'));
    await selectByLabelAndOption(t('pages.campaign-creation.target-profiles-list-label'), this.targetProfiles[0].name);

    // when
    await clickByName(t('pages.campaign-creation.actions.create'));

    sinon.assert.calledWithMatch(this.createCampaignSpy, { name: 'Ma campagne' });
    // then
    assert.ok(true);
  });

  module('when there are errors', function () {
    test('it should display errors messages when the name, the campaign purpose and the external user id fields are empty', async function (assert) {
      // given
      const campaign = EmberObject.create({
        errors: {
          name: [
            {
              message: 'CAMPAIGN_NAME_IS_REQUIRED',
            },
          ],
          idPixLabel: [
            {
              message: 'EXTERNAL_USER_ID_IS_REQUIRED',
            },
          ],
          type: [
            {
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            },
          ],
        },
      });

      this.errors = campaign.errors;

      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.contains(t('api-errors-messages.campaign-creation.name-required'));
      assert.contains(t('api-errors-messages.campaign-creation.purpose-required'));
      assert.contains(t('api-errors-messages.campaign-creation.external-user-id-required'));
    });

    test('it should display errors messages when the target profile field is empty', async function (assert) {
      // given
      const campaign = EmberObject.create({
        errors: {
          targetProfile: [
            {
              message: 'TARGET_PROFILE_IS_REQUIRED',
            },
          ],
        },
      });
      this.errors = campaign.errors;

      // when
      await renderScreen(
        hbs`<Campaign::CreateForm
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{errors}}
          @membersSortedByFullName={{this.defaultMembers}} />`
      );
      await clickByName(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.contains(t('api-errors-messages.campaign-creation.target-profile-required'));
    });
  });
});
