import { module, test } from 'qunit';
import sinon from 'sinon';
import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';

module('Integration | Component | Campaign::CreateForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  let prescriber;
  let defaultMembers;
  let store;

  hooks.beforeEach(function () {
    this.createCampaignSpy = (event) => {
      event.preventDefault();
    };
    this.cancelSpy = () => {};
    this.errors = {};

    store = this.owner.lookup('service:store');

    prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
      features: {
        MULTIPLE_SENDING_ASSESSMENT: false,
        COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: false,
      },
    });

    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }

    defaultMembers = [prescriber];
    this.owner.register('service:current-user', CurrentUserStub);
    this.set('campaign', store.createRecord('campaign', { ownerId: prescriber.id }));
    this.set('defaultMembers', defaultMembers);
    this.targetProfiles = [];
  });

  test('it should contain inputs, attributes and validation button', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.name.label'))).exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('input[type=text]').hasAttribute('maxLength', '255');
    assert.dom('textarea').hasAttribute('maxLength', '5000');
  });

  test("it should display campaign's name", async function (assert) {
    // given
    this.campaign.name = 'Campagne de test';

    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    assert
      .dom(screen.getByRole('textbox', { name: this.intl.t('pages.campaign-creation.name.label') }))
      .hasValue('Campagne de test');
  });

  test('it should display block information for owner', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );
    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.owner.info'), { exact: true })).exists();
    assert.dom(screen.getAllByText(this.intl.t('pages.campaign-creation.owner.title'))[0]).exists();
  });

  test("it should auto complete owner field with owner's full name", async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );
    await click(screen.getByLabelText(this.intl.t('pages.campaign-creation.owner.label'), { exact: false }));
    await screen.findByRole('listbox');

    // then
    assert.dom(screen.getByRole('option', { name: 'Adam Troisjour', selected: true })).exists();
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    // then
    assert
      .dom(
        screen.getByText(this.intl.t('common.form.mandatory-fields'), {
          exact: false,
        }),
      )
      .exists();
  });

  module('when campaign is of type ASSESSMENT', function () {
    test('it should have checked ASSESSMENT', async function (assert) {
      // given
      this.campaign.type = 'ASSESSMENT';
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      assert.dom(screen.getByLabelText(this.intl.t('pages.campaign-creation.purpose.assessment'))).isChecked();
    });

    test('it should fill target-profile fields', async function (assert) {
      // given
      const targetProfile = store.createRecord('target-profile', {
        id: '1',
        name: 'Target profile 1',
        description: 'Description 1',
        category: 'Category 1',
      });
      this.targetProfiles = [targetProfile];
      this.campaign.type = 'ASSESSMENT';
      this.campaign.targetProfile = targetProfile;

      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      assert.strictEqual(
        screen.getByRole('button', { name: this.intl.t('pages.campaign-creation.target-profiles-list-label') })
          .innerText,
        targetProfile.name,
      );
    });

    test('it should fill multiple sendings fields', async function (assert) {
      // given
      prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;
      this.campaign.type = 'ASSESSMENT';
      this.campaign.multipleSendings = true;

      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      const radiogroup = screen.getByRole('radiogroup', {
        name: this.intl.t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
      });
      assert.dom(within(radiogroup).getByLabelText(this.intl.t('pages.campaign-creation.yes'))).isChecked();
    });
  });

  module('when campaign is of type PROFILES_COLLECTION', function () {
    test('it should have checked PROFILES_COLLECTION', async function (assert) {
      // given
      this.campaign.type = 'PROFILES_COLLECTION';

      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      assert.dom(screen.getByLabelText(this.intl.t('pages.campaign-creation.purpose.profiles-collection'))).isChecked();
    });

    test('it should fill multiple sendings fields', async function (assert) {
      // given
      this.campaign.type = 'PROFILES_COLLECTION';
      this.campaign.multipleSendings = true;

      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      const radiogroup = screen.getByRole('radiogroup', {
        name: this.intl.t('pages.campaign-creation.multiple-sendings.profiles.question-label'),
      });
      assert.dom(within(radiogroup).getByLabelText(this.intl.t('pages.campaign-creation.yes'))).isChecked();
    });
  });

  module('when user choose to create a campaign of type ASSESSMENT', function () {
    test('it should display fields for campaign title and target profile', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.test-title.label'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.purpose.label'))).exists();
    });

    test('it should display the purpose explanation of an assessment campaign', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.purpose.assessment-info'))).exists();
      assert
        .dom(screen.queryByText(this.intl.t('pages.campaign-creation.purpose.profiles-collection-info')))
        .doesNotExist();
    });

    module('when the user chose a target profile', function () {
      test('it should display informations about target profile', async function (assert) {
        // given
        this.targetProfiles = [
          store.createRecord('target-profile', {
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
            tubeCount: 11,
            thematicResultCount: 12,
            hasStage: true,
          }),
          store.createRecord('target-profile', {
            id: '2',
            name: 'targetProfile2',
            description: 'description2',
            tubeCount: 21,
            thematicResultCount: 22,
            hasStage: false,
          }),
        ];

        // when
        const screen = await render(
          hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
        );
        await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

        await click(
          screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
        );
        await click(await screen.findByRole('option', { name: 'targetProfile1' }));

        // then
        assert.dom(screen.getByText('description1')).exists();
        assert.dom(screen.getByText(this.intl.t('common.target-profile-details.subjects', { value: 11 }))).exists();
        assert
          .dom(screen.getByText(this.intl.t('common.target-profile-details.thematic-results', { value: 12 })))
          .exists();
      });

      test('it should display a message about result', async function (assert) {
        // given
        this.targetProfiles = [
          store.createRecord('target-profile', {
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
            tubeCount: 11,
            thematicResultCount: 12,
            hasStage: true,
          }),
          store.createRecord('target-profile', {
            id: '2',
            name: 'targetProfile2',
            description: 'description2',
            tubeCount: 21,
            thematicResultCount: 22,
            hasStage: false,
          }),
        ];

        // when
        const screen = await render(
          hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
        );
        await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

        await click(
          screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
        );
        await click(await screen.findByRole('option', { name: 'targetProfile1' }));

        // then
        assert.dom(screen.getByText(this.intl.t('common.target-profile-details.results.common'))).exists();
      });

      module('Displaying options and categories', function () {
        test('it should display options in alphapetical order', async function (assert) {
          // given
          this.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile4',
              description: 'description4',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
              category: 'B',
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile3',
              description: 'description3',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
              category: 'B',
            }),
            store.createRecord('target-profile', {
              id: '3',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 33,
              thematicResultCount: 12,
              hasStage: true,
              category: 'A',
            }),
            store.createRecord('target-profile', {
              id: '4',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 44,
              thematicResultCount: 12,
              hasStage: true,
              category: 'A',
            }),
          ];

          // when
          const screen = await render(
            hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
          );
          await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

          await click(
            screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
          );
          let options = await screen.findAllByRole('option');

          // then
          options = options.map((option) => {
            return option.innerText;
          });
          assert.deepEqual(options, ['targetProfile1', 'targetProfile2', 'targetProfile3', 'targetProfile4']);
        });

        test('it should display options with OTHER category at last position', async function (assert) {
          // given
          this.targetProfiles = [
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile3',
              description: 'description3',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
              category: 'OTHER',
            }),
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile4',
              description: 'description4',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
              category: 'A',
            }),
          ];

          // when
          const screen = await render(
            hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
          );
          await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

          await click(
            screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
          );
          let options = await screen.findAllByRole('option');

          // then
          options = options.map((option) => {
            return option.innerText;
          });
          assert.deepEqual(options, ['targetProfile4', 'targetProfile3']);
        });
      });
    });

    module('when the user wants to clear the content of the target profile input', function (hooks) {
      hooks.beforeEach(function () {
        this.targetProfiles = [
          store.createRecord('target-profile', {
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
          }),
        ];
      });
    });

    module('multiple sending', function () {
      test('it should not display multiple sendings field', async function (assert) {
        // when
        const screen = await render(
          hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
        );
        await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

        // then
        assert
          .dom(
            screen.queryByLabelText(
              this.intl.t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
            ),
          )
          .doesNotExist();
        assert
          .dom(screen.queryByLabelText(this.intl.t('pages.campaign-creation.multiple-sendings.assessments.info')))
          .doesNotExist();
      });

      test('it should display multiple sendings field', async function (assert) {
        // given
        this.targetProfiles = [
          store.createRecord('target-profile', {
            id: '1',
            name: 'targetProfile1',
            description: 'description1',
            tubeCount: 11,
            thematicResultCount: 12,
            hasStage: true,
          }),
          store.createRecord('target-profile', {
            id: '2',
            name: 'targetProfile2',
            description: 'description2',
            tubeCount: 21,
            thematicResultCount: 22,
            hasStage: false,
          }),
        ];
        prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;

        // when
        const screen = await render(
          hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
        );
        await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

        await click(
          screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
        );
        await click(await screen.findByRole('option', { name: 'targetProfile1' }));

        // then
        assert.dom(screen.getByText(this.intl.t('common.target-profile-details.results.common'))).exists();
      });

      module('when target profile are knowledge elements resettable', function () {
        test('it should display specific message', async function (assert) {
          // given
          prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;

          this.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
              areKnowledgeElementsResettable: true,
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
            }),
          ];

          // when
          const screen = await render(
            hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
          );
          await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

          await click(
            screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
          );
          await click(await screen.findByRole('option', { name: 'targetProfile1' }));

          // then
          assert
            .dom(
              screen.getByText(this.intl.t('pages.campaign-creation.multiple-sendings.knowledge-elements-resettable'), {
                exact: false,
              }),
            )
            .exists();
        });
      });

      module('when target profile are not knowledge elements resettable', function () {
        test('it should not display specific message', async function (assert) {
          // given
          this.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
              areKnowledgeElementsResettable: false,
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
            }),
          ];
          prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;

          // when
          const screen = await render(
            hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @targetProfiles={{this.targetProfiles}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
          );
          await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

          await click(
            screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
          );
          await click(await screen.findByRole('option', { name: 'targetProfile1' }));

          // then
          assert
            .dom(
              screen.queryByText(
                this.intl.t('pages.campaign-creation.multiple-sendings.knowledge-elements-resettable'),
                {
                  exact: false,
                },
              ),
            )
            .doesNotExist();
        });
      });
    });
  });

  module('when user choose to create a campaign of type PROFILES_COLLECTION', () => {
    test('it should not display fields for campaign title and target profile', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.queryByText(this.intl.t('pages.campaign-creation.test-title.label'))).doesNotExist();
      assert.dom(screen.queryByText(this.intl.t('pages.campaign-creation.target-profiles-list-label'))).doesNotExist();
    });

    test('it should display fields for enabling multiple sendings', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert
        .dom(screen.getByText(this.intl.t('pages.campaign-creation.multiple-sendings.profiles.question-label')))
        .exists();
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.multiple-sendings.profiles.info'))).exists();
    });

    test('it should display the purpose explanation of a profiles collection campaign', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.purpose.profiles-collection-info'))).exists();
      assert.dom(screen.queryByText(this.intl.t('pages.campaign-creation.purpose.assessment-info'))).doesNotExist();
    });
  });

  test('it should fill external user ID selection (yes)', async function (assert) {
    // given
    this.campaign.idPixLabel = 'Numéro étudiant';

    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    // then
    const externalIdentifier = screen
      .getByText(this.intl.t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
      .closest('fieldset');
    const element = within(externalIdentifier).getByRole('radio', { name: this.intl.t('pages.campaign-creation.yes') });

    assert.dom(element).isChecked();
    assert
      .dom(
        screen.getByRole('textbox', {
          name: `${this.intl.t('pages.campaign-creation.external-id-label.label')} ${this.intl.t(
            'pages.campaign-creation.external-id-label.suggestion',
          )}`,
        }),
      )
      .hasValue('Numéro étudiant');
  });

  test('it should fill external user ID selection (no)', async function (assert) {
    // given
    this.campaign.idPixLabel = null;

    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    // then
    const externalIdentifier = screen
      .getByText(this.intl.t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
      .closest('fieldset');
    const element = within(externalIdentifier).getByRole('radio', { name: this.intl.t('pages.campaign-creation.no') });

    assert.dom(element).isChecked();
  });

  module('when user has not chosen yet to ask or not an external user ID', function () {
    test('it should not fill external user ID selection', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      const externalIdentifier = screen
        .getByText(this.intl.t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
        .closest('fieldset');

      assert.dom(within(externalIdentifier).getByLabelText(this.intl.t('pages.campaign-creation.no'))).isNotChecked();
      assert.dom(within(externalIdentifier).getByLabelText(this.intl.t('pages.campaign-creation.yes'))).isNotChecked();
    });

    test('it should not display gdpr footnote', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );

      // then
      assert.dom(screen.queryByText(this.intl.t('pages.campaign-creation.legal-warning'))).doesNotExist();
    });
  });

  module('when user choose not to ask an external user ID', function () {
    test('it should not display gdpr footnote either', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.no'));

      // then
      assert.dom(screen.queryByText(this.intl.t('pages.campaign-creation.legal-warning'))).doesNotExist();
    });
  });

  module('when user choose to ask an external user ID', function () {
    test('it should display gdpr footnote', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.campaign-creation.legal-warning'))).exists();
    });

    test('it set the external id as required', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.yes'));

      // then
      const label = screen.getByLabelText(new RegExp(this.intl.t('pages.campaign-creation.external-id-label.label')));
      assert.true(label.hasAttribute('aria-required', false));
    });
  });

  test('it should fill campaign title', async function (assert) {
    // given
    this.campaign.type = 'ASSESSMENT';
    this.campaign.title = 'Mon titre de parcours';

    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    assert
      .dom(screen.getByRole('textbox', { name: this.intl.t('pages.campaign-creation.test-title.label') }))
      .hasValue('Mon titre de parcours');
  });

  test('it should fill campaign landing page text', async function (assert) {
    // given
    this.campaign.customLandingPageText = 'Mon texte de landing page';

    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );

    assert
      .dom(screen.getByRole('textbox', { name: this.intl.t('pages.campaign-creation.landing-page-text.label') }))
      .hasValue('Mon texte de landing page');
  });

  test('it should send campaign creation action when submitted', async function (assert) {
    // given
    const targetProfile = { name: 'targetProfile1', id: 123 };
    this.targetProfiles = [targetProfile];
    this.createCampaignSpy = sinon.stub();

    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );
    await fillByLabel(`* ${this.intl.t('pages.campaign-creation.name.label')}`, 'Ma campagne');
    await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));
    await click(
      screen.getByLabelText(this.intl.t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
    );
    await click(await screen.findByRole('option', { name: targetProfile.name }));

    // when
    await clickByName(this.intl.t('pages.campaign-creation.actions.create'));

    sinon.assert.calledWithExactly(this.createCampaignSpy, this.campaign);
    // then
    assert.ok(true);
  });

  test('it should not display the explanation of automatic compute certificability if the feature is not activated', async function (assert) {
    // when
    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );
    await clickByName(this.intl.t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.queryByRole('link', { name: 'Élèves' })).doesNotExist();
  });

  test('it should display the explanation of automatic compute certificability if the feature is activated', async function (assert) {
    // when
    prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY = true;

    const screen = await render(
      hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
    );
    await clickByName(this.intl.t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.getByRole('link', { name: 'Élèves' })).exists();
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
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(this.intl.t('api-error-messages.campaign-creation.name-required'))).exists();
      assert.dom(screen.getByText(this.intl.t('api-error-messages.campaign-creation.purpose-required'))).exists();
      assert
        .dom(screen.getByText(this.intl.t('api-error-messages.campaign-creation.external-user-id-required')))
        .exists();
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
      const screen = await render(
        hbs`<Campaign::CreateForm
  @campaign={{this.campaign}}
  @onSubmit={{this.createCampaignSpy}}
  @onCancel={{this.cancelSpy}}
  @errors={{this.errors}}
  @targetProfiles={{this.targetProfiles}}
  @membersSortedByFullName={{this.defaultMembers}}
/>`,
      );
      await clickByName(this.intl.t('pages.campaign-creation.purpose.assessment'));

      // then
      assert
        .dom(screen.getByText(this.intl.t('api-error-messages.campaign-creation.target-profile-required')))
        .exists();
    });
  });
});
